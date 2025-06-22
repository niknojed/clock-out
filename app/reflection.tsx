import React, { useState, useRef, useEffect } from 'react'
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated
} from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { projectService } from '../src/services/projectService'

export default function ReflectionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>()
  const [reflectionText, setReflectionText] = useState('')
  const [showStructuredOptions, setShowStructuredOptions] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const textInputRef = useRef<TextInput>(null)
  const fadeAnim = new Animated.Value(0)

  useEffect(() => {
    // Auto-focus and animate in
    setTimeout(() => {
      textInputRef.current?.focus()
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start()
    }, 300)
  }, [])

  const saveReflection = async () => {
    if (!reflectionText.trim() && !showStructuredOptions) return
    
    setIsSaving(true)
    
    try {
      await projectService.createReflection({
        session_id: sessionId || 'local-session',
        reflection_type: 'voice_journal', // Using this as the freeform type
        reflection_data: {
          text: reflectionText,
          timestamp: new Date().toISOString(),
          word_count: reflectionText.trim().split(' ').length
        }
      })
      
      console.log('✅ Reflection saved')
      
      // Gentle exit animation
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        router.push('/')
      })
      
    } catch (error) {
      console.log('❌ Error saving reflection:', error)
      setIsSaving(false)
    }
  }

  const handleQuickSave = () => {
    if (reflectionText.trim()) {
      saveReflection()
    } else {
      // If no text, just go home
      router.push('/')
    }
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.closeText}>Done</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>How was that?</Text>
          
          <TouchableOpacity onPress={handleQuickSave} disabled={isSaving}>
            <Text style={[styles.saveText, isSaving && styles.savingText]}>
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Main writing area */}
        <ScrollView style={styles.writingContainer} showsVerticalScrollIndicator={false}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            value={reflectionText}
            onChangeText={setReflectionText}
            placeholder="What's on your mind? How did that feel?

You can write about anything - what surprised you, what flowed well, what you discovered, or just dump your thoughts..."
            placeholderTextColor="#9ca3af"
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
            returnKeyType="default"
            enablesReturnKeyAutomatically={false}
          />
        </ScrollView>

        {/* Optional structured prompts */}
        {reflectionText.length > 50 && !showStructuredOptions && (
          <Animated.View style={styles.promptContainer}>
            <TouchableOpacity 
              style={styles.promptButton}
              onPress={() => setShowStructuredOptions(true)}
            >
              <Text style={styles.promptText}>+ Add guided reflection</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Structured options (if requested) */}
        {showStructuredOptions && (
          <View style={styles.structuredContainer}>
            <Text style={styles.structuredTitle}>Want to explore deeper?</Text>
            <View style={styles.structuredOptions}>
              <TouchableOpacity style={styles.structuredOption}>
                <Text style={styles.structuredOptionText}>🧠 Quick energy check</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.structuredOption}>
                <Text style={styles.structuredOptionText}>🎨 Creative alignment</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.structuredOption}>
                <Text style={styles.structuredOptionText}>💬 Partner perspective</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => setShowStructuredOptions(false)}>
              <Text style={styles.hideOptionsText}>Actually, I'm good</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Word count and gentle encouragement */}
        {reflectionText.length > 0 && (
          <View style={styles.footerInfo}>
            <Text style={styles.wordCount}>
              {reflectionText.trim().split(' ').filter(word => word.length > 0).length} words
            </Text>
            {reflectionText.length > 100 && (
              <Text style={styles.encouragement}>
                Nice reflection ✨
              </Text>
            )}
          </View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#f3f4f6',
  },
  closeText: {
    fontSize: 17,
    color: '#8b5cf6',
    fontWeight: '400',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveText: {
    fontSize: 17,
    color: '#8b5cf6',
    fontWeight: '600',
  },
  savingText: {
    color: '#9ca3af',
  },
  writingContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  textInput: {
    fontSize: 17,
    lineHeight: 24,
    color: '#1f2937',
    fontFamily: Platform.OS === 'ios' ? 'SF Pro Text' : 'System',
    paddingTop: 20,
    paddingBottom: 40,
    minHeight: 400,
  },
  promptContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#f3f4f6',
  },
  promptButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
  },
  promptText: {
    fontSize: 15,
    color: '#6b7280',
    fontWeight: '500',
  },
  structuredContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#f8fafc',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
  },
  structuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  structuredOptions: {
    gap: 12,
    marginBottom: 16,
  },
  structuredOption: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  structuredOptionText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  hideOptionsText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
    fontWeight: '400',
  },
  footerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 0.5,
    borderTopColor: '#f3f4f6',
  },
  wordCount: {
    fontSize: 13,
    color: '#9ca3af',
  },
  encouragement: {
    fontSize: 13,
    color: '#10b981',
    fontWeight: '500',
  },
})