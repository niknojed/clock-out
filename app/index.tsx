// app/index.tsx - Home Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  SafeAreaView,
  Modal,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  // State
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [flowDuration, setFlowDuration] = useState('15'); // default 15 minutes

  // Load recent projects on mount
  useEffect(() => {
    loadRecentProjects();
  }, []);

  // Load recent projects from storage
  const loadRecentProjects = async () => {
    try {
      const projects = await AsyncStorage.getItem('projects');
      if (projects) {
        setRecentProjects(JSON.parse(projects));
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  // Start flow session with selected project
  const startFlowSession = (projectName: string) => {
    // Convert input to minutes (number)
    const durationMinutes = parseInt(flowDuration, 10) || 15;
    
    router.push({
      pathname: '/flow-timer',
      params: {
        projectName,
        duration: (durationMinutes * 60).toString() // Convert to seconds
      }
    });
    
    // Reset modal state
    setModalVisible(false);
    setNewProjectName('');
  };

  // Create new project and start session
  const createNewProject = () => {
    if (!newProjectName.trim()) {
      Alert.alert(
        'Project Name Required',
        'Please enter a name for your project.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    startFlowSession(newProjectName.trim());
  };

  // Render recent project item
  const renderProjectItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.projectItem}
      onPress={() => {
        setModalVisible(true);
        setNewProjectName(item);
      }}
    >
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']} // indigo to purple
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.projectGradient}
      >
        <Text style={styles.projectName}>{item}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Flow Timer</Text>
      
      {/* Quick Start Button */}
      <TouchableOpacity
        style={styles.quickStartButton}
        onPress={() => setModalVisible(true)}
      >
        <LinearGradient
          colors={['#6366f1', '#8b5cf6', '#3b82f6']} // indigo, purple, blue
          style={styles.quickStartGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Feather name="clock" size={24} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.quickStartText}>Start Flow Timer</Text>
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Recent Projects */}
      <View style={styles.recentProjectsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Projects</Text>
          <Link href="/projects" asChild>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        {recentProjects.length > 0 ? (
          <FlatList
            data={recentProjects.slice(0, 5)} // Show only 5 most recent
            renderItem={renderProjectItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.projectsList}
          />
        ) : (
          <Text style={styles.noProjectsText}>
            No recent projects. Start your first flow session!
          </Text>
        )}
      </View>
      
      {/* New Flow Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Start Flow Session</Text>
            
            <Text style={styles.label}>Project Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter project name"
              value={newProjectName}
              onChangeText={setNewProjectName}
            />
            
            <Text style={styles.label}>Duration (minutes)</Text>
            <TextInput
              style={styles.input}
              placeholder="15"
              value={flowDuration}
              onChangeText={setFlowDuration}
              keyboardType="number-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.buttonStart]}
                onPress={createNewProject}
              >
                <Text style={styles.buttonStartText}>Start Flow</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#1E293B',
  },
  quickStartButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickStartGradient: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 10,
  },
  quickStartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  recentProjectsContainer: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  viewAllText: {
    color: '#6366F1',
    fontWeight: '600',
  },
  projectsList: {
    paddingVertical: 8,
  },
  projectItem: {
    marginRight: 12,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  projectGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: 140,
    height: 100,
    justifyContent: 'flex-end',
  },
  projectName: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  noProjectsText: {
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 20,
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1E293B',
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    padding: 12,
    elevation: 2,
    flex: 1,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#F1F5F9',
    marginRight: 8,
  },
  buttonCancelText: {
    color: '#64748B',
    fontWeight: 'bold',
  },
  buttonStart: {
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  buttonStartText: {
    color: 'white',
    fontWeight: 'bold',
  },
});