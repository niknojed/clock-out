import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { projectService } from '../src/services/projectService'

export default function FlowTimer() {
  const [duration, setDuration] = useState(15) // minutes
  const [timeLeft, setTimeLeft] = useState(15 * 60) // seconds
  const [isRunning, setIsRunning] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      // Timer completed
      handleTimerComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const startTimer = () => {
    setIsRunning(true)
    setSessionStartTime(Date.now())
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(duration * 60)
    setSessionStartTime(null)
  }

  const handleTimerComplete = async () => {
    setIsRunning(false)
    
    const actualDuration = sessionStartTime 
      ? Math.round((Date.now() - sessionStartTime) / 60000) 
      : duration
    
    await saveSession(actualDuration, duration)
  }

  const saveSession = async (actualDuration: number, plannedDuration: number) => {
    try {
      const session = await projectService.createSession({
        duration_minutes: actualDuration,
        planned_duration: plannedDuration,
        session_type: 'flow',
        completed_at: new Date().toISOString()
      })
      
      console.log('✅ Session saved:', session)
      
      // Navigate to reflection with session ID
      router.push(`/reflection?sessionId=${session.id}`)
    } catch (error) {
      console.log('❌ Error saving session:', error)
      // Still navigate to reflection even if save fails
      router.push('/reflection')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleEndEarly = () => {
    if (sessionStartTime) {
      const actualDuration = Math.round((Date.now() - sessionStartTime) / 60000)
      saveSession(actualDuration, duration)
    } else {
      router.push('/reflection')
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Flow Timer</Text>
      
      {/* Duration Selection */}
      {!isRunning && timeLeft === duration * 60 && (
        <View style={styles.durationContainer}>
          <Text style={styles.label}>Select Duration:</Text>
          <View style={styles.durationButtons}>
            {[10, 15, 20, 30].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.durationButton,
                  duration === mins && styles.selectedDuration
                ]}
                onPress={() => {
                  setDuration(mins)
                  setTimeLeft(mins * 60)
                }}
              >
                <Text style={[
                  styles.durationText,
                  duration === mins && styles.selectedDurationText
                ]}>
                  {mins}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Timer Display */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
        <Text style={styles.statusText}>
          {isRunning ? 'In Flow' : timeLeft === 0 ? 'Complete!' : 'Ready to Start'}
        </Text>
      </View>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={startTimer}>
            <Text style={styles.buttonText}>Start Flow</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity style={styles.pauseButton} onPress={pauseTimer}>
              <Text style={styles.buttonText}>Pause</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.endButton} onPress={handleEndEarly}>
              <Text style={styles.buttonText}>End Session</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.homeButton} onPress={() => router.push('/')}>
        <Text style={styles.homeButtonText}>← Back to Home</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 40,
  },
  durationContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  durationButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#e5e7eb',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedDuration: {
    backgroundColor: '#8b5cf6',
    borderColor: '#7c3aed',
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  selectedDurationText: {
    color: 'white',
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  timerText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#1f2937',
    fontFamily: 'monospace',
  },
  statusText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  controlsContainer: {
    gap: 16,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  pauseButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  endButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  resetButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButtonText: {
    color: '#6b7280',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
  },
  homeButtonText: {
    fontSize: 16,
    color: '#8b5cf6',
  },
})