// app/projects.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';

// Import our project service
import projectService, { FlowSession } from '../src/services/projectService';
import { formatDuration, formatRelativeDate } from '../src/utils/timeUtils';

export default function ProjectsScreen() {
  // State
  const [projects, setProjects] = useState<string[]>([]);
  const [sessions, setSessions] = useState<FlowSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects on mount
  useEffect(() => {
    loadProjectsAndSessions();
  }, []);

  // Load projects and sessions from storage
  const loadProjectsAndSessions = async () => {
    try {
      setLoading(true);
      
      // Load projects
      const projectsList = await projectService.getAllProjects();
      setProjects(projectsList);
      
      // Load sessions
      const sessionsList = await projectService.getAllSessions();
      setSessions(sessionsList);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Could not load projects data.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate project stats
  const getProjectStats = (projectName: string) => {
    const projectSessions = sessions.filter(
      session => session.projectName === projectName
    );
    
    // Total sessions
    const totalSessions = projectSessions.length;
    
    // Total flow time in seconds
    const totalTime = projectSessions.reduce(
      (sum, session) => sum + (session.duration || 0), 
      0
    );
    
    // Last session date
    const lastSession = projectSessions.length > 0 
      ? new Date(projectSessions[projectSessions.length - 1].timestamp)
      : null;
    
    return {
      totalSessions,
      totalTime,
      lastSession
    };
  };

  // Start a flow session for a project
  const startProjectFlow = (projectName: string) => {
    router.push({
      pathname: '/flow-timer',
      params: { projectName }
    });
  };

  // Render project item
  const renderProjectItem = ({ item: projectName }: { item: string }) => {
    const stats = getProjectStats(projectName);
    
    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() => startProjectFlow(projectName)}
      >
        <View style={styles.projectCardContent}>
          <Text style={styles.projectName}>{projectName}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Feather name="clock" size={14} color="#64748B" />
              <Text style={styles.statText}>
                {formatDuration(stats.totalTime)}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Feather name="zap" size={14} color="#64748B" />
              <Text style={styles.statText}>
                {stats.totalSessions} {stats.totalSessions === 1 ? 'session' : 'sessions'}
              </Text>
            </View>
            
            <View style={styles.statItem}>
              <Feather name="calendar" size={14} color="#64748B" />
              <Text style={styles.statText}>
                {formatRelativeDate(stats.lastSession)}
              </Text>
            </View>
          </View>
        </View>
        
        <LinearGradient
          colors={['#6366f1', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.projectCardAccent}
        />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.title}>My Projects</Text>
        <View style={styles.placeholder} />
      </View>
      
      {projects.length > 0 ? (
        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Feather name="folder" size={64} color="#CBD5E1" />
          <Text style={styles.emptyText}>No projects yet</Text>
          <Text style={styles.emptySubtext}>
            Start a flow session to create your first project
          </Text>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.startButtonText}>Start Flow Timer</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  placeholder: {
    width: 40,
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  projectCardAccent: {
    width: 6,
    height: '100%',
  },
  projectCardContent: {
    flex: 1,
    padding: 16,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    color: '#64748B',
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  startButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});