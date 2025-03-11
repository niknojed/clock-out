// src/utils/timeUtils.ts

/**
 * Format seconds to mm:ss display format
 * @param seconds - Total seconds to format
 * @returns Formatted time string (mm:ss)
 */
export const formatTimeMMSS = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  /**
   * Format seconds to human-readable duration (Xh Ym)
   * @param seconds - Total seconds to format
   * @returns Formatted duration string
   */
  export const formatDuration = (seconds: number): string => {
    const totalMinutes = Math.floor(seconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  /**
   * Format a date relative to current time
   * @param date - Date object to format
   * @returns Formatted date string
   */
  export const formatRelativeDate = (date: Date | null): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };
  
  /**
   * Get gradient colors based on remaining time
   * @param timeRemaining - Remaining time in seconds
   * @param totalTime - Total session time in seconds
   * @returns Array of gradient colors
   */
  export const getTimerGradientColors = (timeRemaining: number, totalTime: number): string[] => {
    // Calculate percentage of time remaining
    const percentRemaining = (timeRemaining / totalTime) * 100;
    
    // Default flow state colors (blue/purple)
    if (percentRemaining > 25) {
      return ['#6366f1', '#8b5cf6', '#3b82f6']; // indigo, purple, blue
    } 
    // Warning state (yellow/orange)
    else if (percentRemaining > 10) {
      return ['#f59e0b', '#f97316', '#ec4899']; // amber, orange, pink
    } 
    // Critical state (red)
    else {
      return ['#ef4444', '#e11d48', '#ec4899']; // red, rose, pink
    }
  };