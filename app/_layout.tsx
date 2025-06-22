import { useEffect } from 'react'
import { Stack } from 'expo-router'
import { useAuth } from '../src/hooks/useAuth'

export default function RootLayout() {
  const { user, loading } = useAuth()

  if (loading) {
    // Add a proper loading screen here
    return null
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="flow-timer" options={{ title: 'Flow Timer' }} />
      <Stack.Screen name="reflection" options={{ title: 'Reflection' }} />
      <Stack.Screen name="projects" options={{ title: 'Projects' }} />
    </Stack>
  )
}