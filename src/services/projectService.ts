// src/services/projectService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

// TypeScript interfaces for our data models
export interface FlowSession {
  id: string;
  projectName: string;
  reflection: string;
  timestamp: string;
  duration: number;
}

/**
 * Service for managing projects and flow sessions
 */
class ProjectService {
  /**
   * Save a new flow session
   * @param projectName - Name of the project
   * @param reflection - Reflection text from the session
   * @param duration - Duration of the session in seconds
   * @returns The newly created session object
   */
  async saveFlowSession(
    projectName: string, 
    reflection: string, 
    duration: number = 15 * 60
  ): Promise<FlowSession> {
    try {
      // Create new flow session object
      const newSession: FlowSession = {
        id: Date.now().toString(),
        projectName,
        reflection,
        timestamp: new Date().toISOString(),
        duration
      };
      
      // Get existing sessions from storage
      const existingSessions = await AsyncStorage.getItem('flowSessions');
      const sessionsArray: FlowSession[] = existingSessions 
        ? JSON.parse(existingSessions) 
        : [];
      
      // Add new session
      sessionsArray.push(newSession);
      
      // Save updated sessions
      await AsyncStorage.setItem('flowSessions', JSON.stringify(sessionsArray));
      
      // Also update projects list
      await this.addProject(projectName);
      
      return newSession;
    } catch (error) {
      console.error('Error saving flow session:', error);
      throw error;
    }
  }
  
  /**
   * Add a new project to the projects list
   * @param projectName - Name of the project to add
   * @returns Updated array of project names
   */
  async addProject(projectName: string): Promise<string[]> {
    try {
      const existingProjects = await AsyncStorage.getItem('projects');
      const projectsArray: string[] = existingProjects 
        ? JSON.parse(existingProjects) 
        : [];
      
      // Only add project if it doesn't exist already
      if (!projectsArray.includes(projectName)) {
        projectsArray.push(projectName);
        await AsyncStorage.setItem('projects', JSON.stringify(projectsArray));
      }
      
      return projectsArray;
    } catch (error) {
      console.error('Error adding project:', error);
      throw error;
    }
  }
  
  /**
   * Get all projects
   * @returns Array of project names
   */
  async getAllProjects(): Promise<string[]> {
    try {
      const projects = await AsyncStorage.getItem('projects');
      return projects ? JSON.parse(projects) : [];
    } catch (error) {
      console.error('Error getting projects:', error);
      throw error;
    }
  }
  
  /**
   * Get all flow sessions
   * @returns Array of flow session objects
   */
  async getAllSessions(): Promise<FlowSession[]> {
    try {
      const sessions = await AsyncStorage.getItem('flowSessions');
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      throw error;
    }
  }
  
  /**
   * Get sessions for a specific project
   * @param projectName - Name of the project
   * @returns Array of flow session objects for the specified project
   */
  async getSessionsByProject(projectName: string): Promise<FlowSession[]> {
    try {
      const allSessions = await this.getAllSessions();
      return allSessions.filter(session => session.projectName === projectName);
    } catch (error) {
      console.error('Error getting project sessions:', error);
      throw error;
    }
  }
  
  /**
   * Delete a project and all its sessions
   * @param projectName - Name of the project to delete
   */
  async deleteProject(projectName: string): Promise<void> {
    try {
      // Remove from projects list
      const projects = await this.getAllProjects();
      const updatedProjects = projects.filter(p => p !== projectName);
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      
      // Remove all sessions for this project
      const allSessions = await this.getAllSessions();
      const updatedSessions = allSessions.filter(s => s.projectName !== projectName);
      await AsyncStorage.setItem('flowSessions', JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export default new ProjectService();