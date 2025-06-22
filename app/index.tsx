import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { router } from 'expo-router'
import { projectService } from '../src/services/projectService'

export default function FlowTimer() {
  const [duration, setDuration] = useState(15)
  const [timeLeft, setTimeLeft] = useState(15 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null)
  const [flowPhase, setFlowPhase] = useState<'setup' | 'entering' | 'deep' | 'transition' | 'complete'>('setup')
  
  // Animated values for smooth transitions
  const fadeAnim = new Animated.Value(1)
  const pulseAnim = new Animated.Value(1)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          const newTimeLeft = timeLeft - 1
          updateFlowPhase(newTimeLeft)
          return newTimeLeft
        })
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

  const updateFlowPhase = (secondsLeft: number) => {
    const totalSeconds = duration * 60
    const elapsed = totalSeconds - secondsLeft
    const progress = elapsed / totalSeconds

    if (progress < 0.1) {
      setFlowPhase('entering')
    } else if (progress < 0.8) {
      setFlowPhase('deep')
      // Fade UI during deep flow
      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 2000,
        useNativeDriver: true,
      }).start()
    } else if (progress < 0.95) {
      setFlowPhase('transition')
      // Bring UI back for transition
      Animated.timing(fadeAnim, {
        toValue: 0.8,
        duration: 1000,
        useNativeDriver: true,
      }).start()
    }
  }

  const getFlowColors = () => {
    switch (flowPhase) {
      case 'setup':
        return ['#f8fafc', '#e2e8f0'] // Cool, neutral
      case 'entering':
        return ['#fef3e2', '#fed7aa'] // Warm entry
      case 'deep':
        return ['#1e293b', '#334155'] // Deep, focused
      case 'transition':
        return ['#581c87', '#7c3aed'] // Gentle alerting
      case 'complete':
        return ['#065f46', '#10b981'] // Accomplished
      default:
        return ['#f8fafc', '#e2e8f0']
    }
  }

  const startTimer = () => {
    setIsRunning(true)
    setSessionStartTime(Date.now())
    setFlowPhase('entering')
    
    // Start breathing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 4000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 4000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }

  const handleTimerComplete = async () => {
    setIsRunning(false)
    setFlowPhase('complete')
    
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
      router.push(`/reflection?sessionId=${session.id}`)
    } catch (error) {
      console.log('❌ Error saving session:', error)
      router.push('/reflection')
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <LinearGradient
      colors={getFlowColors()}
      style={styles.container}
    >
      {/* Setup Phase */}
      {flowPhase === 'setup' && (
        <Animated.View style={[styles.setupContainer, { opacity: fadeAnim }]}>
          <Text style={styles.title}>Ready to flow?</Text>
          
          <View style={styles.durationContainer}>
            <Text style={styles.durationLabel}>Choose your container</Text>
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
                    {mins}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startTimer}>
            <Text style={styles.startButtonText}>Begin</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Flow State */}
      {(isRunning || flowPhase === 'complete') && (
        <View style={styles.flowContainer}>
          <Animated.View 
            style={[
              styles.timerContainer, 
              { 
                opacity: fadeAnim,
                transform: [{ scale: pulseAnim }]
              }
            ]}
          >
            <Text style={[
              styles.timerText,
              { color: flowPhase === 'deep' ? '#f1f5f9' : '#1f2937' }
            ]}>
              {formatTime(timeLeft)}
            </Text>
            
            {flowPhase !== 'deep' && (
              <Text style={[
                styles.phaseText,
                { color: flowPhase === 'deep' ? '#cbd5e1' : '#6b7280' }
              ]}>
                {flowPhase === 'entering' && 'Settling in...'}
                {flowPhase === 'transition' && 'Wrapping up...'}
                {flowPhase === 'complete' && 'Beautiful work.'}
              </Text>
            )}
          </Animated.View>

          {/* Minimal controls that fade during deep flow */}
          {flowPhase !== 'deep' && flowPhase !== 'complete' && (
            <Animated.View style={[styles.controlsContainer, { opacity: fadeAnim }]}>
              <TouchableOpacity 
                style={styles.subtleButton} 
                onPress={() => {
                  setIsRunning(false)
                  if (sessionStartTime) {
                    const actualDuration = Math.round((Date.now() - sessionStartTime) / 60000)
                    saveSession(actualDuration, duration)
                  }
                }}
              >
                <Text style={styles.subtleButtonText}>Complete session</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
      )}

      {/* Subtle home button */}
      <TouchableOpacity 
        style={[styles.homeButton, { opacity: flowPhase === 'deep' ? 0.1 : 0.6 }]} 
        onPress={() => router.push('/')}
      >
        <Text style={styles.homeButtonText}>×</Text>
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  setupContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: '#1f2937',
    marginBottom: 48,
    textAlign: 'center',
  },
  durationContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  durationLabel: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    fontWeight: '300',
  },
  durationButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  durationButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  selectedDuration: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderColor: '#8b5cf6',
  },
  durationText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#374151',
  },
  selectedDurationText: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#1f2937',
  },
  flowContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 72,
    fontWeight: '200',
    fontFamily: 'monospace',
    letterSpacing: 4,
  },
  phaseText: {
    fontSize: 16,
    fontWeight: '300',
    marginTop: 16,
    textAlign: 'center',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 100,
  },
  subtleButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  subtleButtonText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '300',
  },
  homeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 24,
    color: '#6b7280',
    fontWeight: '200',
  },
})