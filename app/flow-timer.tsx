// app/flow-timer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

// Custom components
import GradientBackground from '../components/GradientBackground';
import Timer from '../components/Timer';

export default function FlowTimerScreen() {
  // Get parameters from router
  const params = useLocalSearchParams<{ 
    projectName: string;
    duration: string;
  }>();
  
  // Get project name from params or use default
  const projectName = params.projectName || "Untitled Project";
  const initialDuration = parseInt(params.duration || '900', 10); // Default 15 minutes (900 seconds)
  
  // State
  const [timeRemaining, setTimeRemaining] = useState(initialDuration);
  const [isActive, setIsActive] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Set up the timer
  useEffect(() => {
    if (isActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(time => time - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      // Time's up, navigate to reflection screen
      navigateToReflection();
    }

    // Clean up interval
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timeRemaining]);

  // Navigate to reflection screen
  const navigateToReflection = () => {
    router.push({
      pathname: '/reflection',
      params: { 
        projectName,
        duration: initialDuration.toString()
      }
    });
  };

  // Toggle timer
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Add more time
  const addTime = (seconds: number) => {
    setTimeRemaining(time => time + seconds);
  };

  // Handle going back
  const handleBack = () => {
    router.back();
  };

  return (
    <GradientBackground timeRemaining={timeRemaining}>
      <SafeAreaView style={styles.container}>
        {/* Back button */}
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBack}
        >
          <Feather name="arrow-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        {/* Project title */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>{projectName}</Text>
          <Text style={styles.subtitle}>Flow State Activated</Text>
        </View>
        
        {/* Timer */}
        <Timer 
          timeRemaining={timeRemaining}
          isActive={isActive}
          toggleTimer={toggleTimer}
          addTime={addTime}
        />
        
        {/* Message */}
        <Text style={styles.message}>
          Focus on your flow. Timer will gently remind you when it's time to reflect.
        </Text>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  message: {
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    maxWidth: 280,
  },
});