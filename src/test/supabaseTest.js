import { supabase } from '../config/supabase'

export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('count(*)')
    
    if (error) {
      console.log('Supabase connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connected successfully!')
    return true
  } catch (err) {
    console.log('❌ Supabase connection failed:', err)
    return false
  }
}