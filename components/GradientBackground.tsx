import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientBackgroundProps {
  timeRemaining: number;
  children: ReactNode;
}

const GradientBackground: React.FC<GradientBackgroundProps> = ({ 
  timeRemaining, 
  children 
}) => {
  // Calculate gradient colors based on time remaining
  const getGradientColors = () => {
    // Default flow state colors (blue/purple)
    if (timeRemaining > 120) { // More than 2 minutes
      return ['#6366f1', '#8b5cf6', '#3b82f6']; // indigo, purple, blue
    } 
    // Warning state (yellow/orange)
    else if (timeRemaining > 60) { // 1-2 minutes
      return ['#f59e0b', '#f97316', '#ec4899']; // amber, orange, pink
    } 
    // Critical state (red)
    else {
      return ['#ef4444', '#e11d48', '#ec4899']; // red, rose, pink
    }
  };

  return (
    <LinearGradient
      colors={getGradientColors()}
      style={styles.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
});

export default GradientBackground;