// components/Timer.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TimerProps {
  timeRemaining: number;
  isActive: boolean;
  toggleTimer: () => void;
  addTime: (seconds: number) => void;
}

const Timer: React.FC<TimerProps> = ({ 
  timeRemaining, 
  isActive, 
  toggleTimer, 
  addTime 
}) => {
  // Format seconds to mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerText}>{formatTime(timeRemaining)}</Text>
      
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={toggleTimer}
        >
          <Feather 
            name={isActive ? 'pause' : 'play'} 
            size={32} 
            color="#FFFFFF" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => addTime(5 * 60)} // Add 5 minutes
        >
          <Feather name="plus-circle" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 32,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
  },
  controlButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 50,
    marginHorizontal: 12,
  },
});

export default Timer;