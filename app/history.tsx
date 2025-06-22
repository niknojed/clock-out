import React, { useEffect, useState } from 'react'
import { View, Text, ScrollView, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function HistoryScreen() {
  const [sessions, setSessions] = useState([])
  const [reflections, setReflections] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const sessionsData = await AsyncStorage.getItem('sessions')
      const reflectionsData = await AsyncStorage.getItem('reflections')
      
      if (sessionsData) setSessions(JSON.parse(sessionsData))
      if (reflectionsData) setReflections(JSON.parse(reflectionsData))
    } catch (error) {
      console.log('Error loading history:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Flow History</Text>
        <Text style={styles.subtitle}>{sessions.length} sessions completed</Text>
      </View>

      {sessions.map((session: any, index) => {
        const sessionReflection = reflections.find((r: any) => r.session_id === session.id)
        
        return (
          <View key={session.id} style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
              <Text style={styles.sessionDuration}>{session.duration_minutes}m</Text>
              <Text style={styles.sessionDate}>{formatDate(session.created_at)}</Text>
            </View>
            
            <Text style={styles.sessionType}>{session.session_type} session</Text>
            
            {sessionReflection && (
              <View style={styles.reflectionTag}>
                <Text style={styles.reflectionText}>
                  Reflected: {sessionReflection.reflection_type.replace('_', ' ')}
                </Text>
              </View>
            )}
          </View>
        )
      })}

      {sessions.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No sessions yet</Text>
          <Text style={styles.emptySubtitle}>Start your first flow session to see your history here</Text>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  sessionCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionDuration: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  sessionDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  sessionType: {
    fontSize: 14,
    color: '#374151',
    textTransform: 'capitalize',
  },
  reflectionTag: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  reflectionText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
})