// app/reflection.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, router } from 'expo-router';

// Import our project service
import projectService from '../src/services/projectService';

export default function ReflectionScreen() {
  // Get parameters from router
  const params = useLocalSearchParams<{ 
    projectName: string;
    duration: string;
  }>();
  
  // Get project name from params or use default
  const projectName = params.projectName || "Untitled Project";
  const duration = parseInt(params.duration || '900', 10); // Default 15 minutes
  
  // State
  const [reflectionText, setReflectionText] = useState('');
  const [currentProjectName, setCurrentProjectName] = useState(projectName);
  const [isSaving, setIsSaving] = useState(false);

  // Save the reflection and project info
  const saveReflection = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    
    try {
      // Save the flow session
      await projectService.saveFlowSession(
        currentProjectName, 
        reflectionText, 
        duration
      );
      
      // Navigate back to home screen
      router.replace('/');
    } catch (error) {
      console.error('Error saving reflection:', error);
      Alert.alert(
        'Error',
        'There was a problem saving your reflection. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <LinearGradient
      colors={['#6366f1', '#8b5cf6', '#3b82f6']} // indigo, purple, blue
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Flow Reflection</Text>
          
          <Text style={styles.label}>What did you accomplish during your flow state?</Text>
          <TextInput
            style={styles.textArea}
            multiline
            textAlignVertical="top"
            value={reflectionText}
            onChangeText={setReflectionText}
            placeholder="I worked on..."
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
          />
          
          <Text style={styles.label}>Project name:</Text>
          <TextInput
            style={styles.input}
            value={currentProjectName}
            onChangeText={setCurrentProjectName}
            placeholder="Name your project"
            placeholderTextColor="rgba(0, 0, 0, 0.4)"
          />
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveReflection}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Saving...' : 'Save & Finish'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    minHeight: 120,
    fontSize: 16,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    marginBottom: 32,
  },
  saveButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: 'bold',
  },
});