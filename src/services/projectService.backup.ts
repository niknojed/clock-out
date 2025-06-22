import { supabase } from '../config/supabase'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface Project {
  id: string
  title: string
  description?: string
  color: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Session {
  id: string
  user_id: string
  project_id?: string
  duration_minutes: number
  planned_duration: number
  session_type: string
  completed_at: string
  created_at: string
}

export interface Reflection {
  id: string
  user_id: string
  session_id: string
  reflection_type: 'quick_pulse' | 'creative_deep_dive' | 'voice_journal' | 'partner_check'
  reflection_data: any
  voice_recording_url?: string
  created_at: string
}

class ProjectService {
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  }

  // PROJECTS
  async getProjects(): Promise<Project[]> {
    try {
      if (!(await this.isAuthenticated())) {
        return this.getLocalProjects()
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching projects:', error)
      return this.getLocalProjects()
    }
  }

  async createProject(projectData: Omit<Project, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<Project> {
    try {
      if (!(await this.isAuthenticated())) {
        return this.createLocalProject(projectData)
      }

      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating project:', error)
      return this.createLocalProject(projectData)
    }
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    try {
      if (!(await this.isAuthenticated())) {
        return this.updateLocalProject(id, updates)
      }

      const { data, error } = await supabase
        .from('projects')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating project:', error)
      return this.updateLocalProject(id, updates)
    }
  }

  async deleteProject(id: string): Promise<void> {
    try {
      if (!(await this.isAuthenticated())) {
        return this.deleteLocalProject(id)
      }

      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting project:', error)
      return this.deleteLocalProject(id)
    }
  }

  // SESSIONS
  async createSession(sessionData: Omit<Session, 'id' | 'user_id' | 'created_at'>): Promise<Session> {
    try {
      if (!(await this.isAuthenticated())) {
        return this.createLocalSession(sessionData)
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([sessionData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating session:', error)
      return this.createLocalSession(sessionData)
    }
  }

  async getSessions(projectId?: string): Promise<Session[]> {
    try {
      if (!(await this.isAuthenticated())) {
        return this.getLocalSessions(projectId)
      }

      let query = supabase
        .from('sessions')
        .select('*')
        .order('completed_at', { ascending: false })

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching sessions:', error)
      return this.getLocalSessions(projectId)
    }
  }

  // REFLECTIONS
  async createReflection(reflectionData: Omit<Reflection, 'id' | 'user_id' | 'created_at'>): Promise<Reflection> {
    try {
      if (!(await this.isAuthenticated())) {
        return this.createLocalReflection(reflectionData)
      }

      const { data, error } = await supabase
        .from('reflections')
        .insert([reflectionData])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error creating reflection:', error)
      return this.createLocalReflection(reflectionData)
    }
  }

  async getReflections(sessionId?: string): Promise<Reflection[]> {
    try {
      if (!(await this.isAuthenticated())) {
        return this.getLocalReflections(sessionId)
      }

      let query = supabase
        .from('reflections')
        .select('*')
        .order('created_at', { ascending: false })

      if (sessionId) {
        query = query.eq('session_id', sessionId)
      }

      const { data, error } = await query
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching reflections:', error)
      return this.getLocalReflections(sessionId)
    }
  }

  // VOICE RECORDINGS
  async uploadVoiceRecording(sessionId: string, audioUri: string): Promise<string> {
    try {
      if (!(await this.isAuthenticated())) {
        return audioUri // Return local URI if offline
      }

      const response = await fetch(audioUri)
      const blob = await response.blob()
      
      const fileName = `voice-${sessionId}-${Date.now()}.m4a`
      const { data, error } = await supabase.storage
        .from('voice-recordings')
        .upload(fileName, blob)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('voice-recordings')
        .getPublicUrl(fileName)

      return publicUrl
    } catch (error) {
      console.error('Error uploading voice recording:', error)
      return audioUri // Fallback to local URI
    }
  }

  // LOCAL STORAGE FALLBACKS (for offline mode)
  private async getLocalProjects(): Promise<Project[]> {
    const projects = await AsyncStorage.getItem('projects')
    return projects ? JSON.parse(projects) : []
  }

  private async createLocalProject(projectData: any): Promise<Project> {
    const projects = await this.getLocalProjects()
    const newProject: Project = {
      ...projectData,
      id: Date.now().toString(),
      user_id: 'local',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    projects.push(newProject)
    await AsyncStorage.setItem('projects', JSON.stringify(projects))
    return newProject
  }

  private async updateLocalProject(id: string, updates: any): Promise<Project> {
    const projects = await this.getLocalProjects()
    const index = projects.findIndex(p => p.id === id)
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates, updated_at: new Date().toISOString() }
      await AsyncStorage.setItem('projects', JSON.stringify(projects))
      return projects[index]
    }
    throw new Error('Project not found')
  }

  private async deleteLocalProject(id: string): Promise<void> {
    const projects = await this.getLocalProjects()
    const filtered = projects.filter(p => p.id !== id)
    await AsyncStorage.setItem('projects', JSON.stringify(filtered))
  }

  private async getLocalSessions(projectId?: string): Promise<Session[]> {
    const sessions = await AsyncStorage.getItem('sessions')
    const allSessions = sessions ? JSON.parse(sessions) : []
    return projectId ? allSessions.filter((s: Session) => s.project_id === projectId) : allSessions
  }

  private async createLocalSession(sessionData: any): Promise<Session> {
    const sessions = await this.getLocalSessions()
    const newSession: Session = {
      ...sessionData,
      id: Date.now().toString(),
      user_id: 'local',
      created_at: new Date().toISOString(),
    }
    sessions.push(newSession)
    await AsyncStorage.setItem('sessions', JSON.stringify(sessions))
    return newSession
  }

  private async getLocalReflections(sessionId?: string): Promise<Reflection[]> {
    const reflections = await AsyncStorage.getItem('reflections')
    const allReflections = reflections ? JSON.parse(reflections) : []
    return sessionId ? allReflections.filter((r: Reflection) => r.session_id === sessionId) : allReflections
  }

  private async createLocalReflection(reflectionData: any): Promise<Reflection> {
    const reflections = await this.getLocalReflections()
    const newReflection: Reflection = {
      ...reflectionData,
      id: Date.now().toString(),
      user_id: 'local',
      created_at: new Date().toISOString(),
    }
    reflections.push(newReflection)
    await AsyncStorage.setItem('reflections', JSON.stringify(reflections))
    return newReflection
  }

  // ANALYTICS
  async getAnalytics() {
    const sessions = await this.getSessions()
    const reflections = await this.getReflections()
    
    return {
      totalSessions: sessions.length,
      totalFlowTime: sessions.reduce((sum, s) => sum + s.duration_minutes, 0),
      averageSessionLength: sessions.length > 0 ? sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length : 0,
      completionRate: sessions.length > 0 ? sessions.filter(s => s.duration_minutes >= s.planned_duration).length / sessions.length : 0,
      reflectionRate: sessions.length > 0 ? reflections.length / sessions.length : 0,
      recentSessions: sessions.slice(0, 10),
    }
  }
}

export const projectService = new ProjectService()