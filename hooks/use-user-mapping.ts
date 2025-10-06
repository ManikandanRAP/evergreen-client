import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api-client'
import { User } from '@/lib/api-client'

interface UserMapping {
  [userId: string]: User
}

export function useUserMapping() {
  const [userMapping, setUserMapping] = useState<UserMapping>({})
  const [loading, setLoading] = useState(false)

  const getUserName = (userId?: string, fallbackName?: string): string => {
    // If we have a fallback name and it's not 'Unknown', use it
    if (fallbackName && fallbackName !== 'Unknown' && fallbackName !== 'null' && fallbackName !== null) {
      return fallbackName
    }
    
    // If we have a user ID, try to get the user from mapping
    if (userId && userId !== 'system' && userId !== 'unknown') {
      const user = userMapping[userId]
      if (user) {
        return user.name || user.email || 'Unknown User'
      }
    }
    
    // Fallback to the provided name or 'Unknown'
    return fallbackName || 'Unknown'
  }

  const fetchUser = async (userId: string) => {
    if (userMapping[userId]) return userMapping[userId]
    
    // Skip fetching for system/unknown IDs
    if (userId === 'system' || userId === 'unknown') {
      return null
    }
    
    try {
      setLoading(true)
      const user = await apiClient.getUserById(userId)
      setUserMapping(prev => ({
        ...prev,
        [userId]: user
      }))
      return user
    } catch (error) {
      console.error(`Failed to fetch user ${userId}:`, error)
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (userIds: string[]) => {
    const uniqueIds = [...new Set(userIds)].filter(id => 
      id && 
      !userMapping[id] && 
      id !== 'system' && 
      id !== 'unknown'
    )
    if (uniqueIds.length === 0) return

    try {
      setLoading(true)
      const userPromises = uniqueIds.map(id => apiClient.getUserById(id))
      const users = await Promise.all(userPromises)
      
      const newMapping: UserMapping = {}
      users.forEach((user, index) => {
        if (user) {
          newMapping[uniqueIds[index]] = user
        }
      })
      
      setUserMapping(prev => ({
        ...prev,
        ...newMapping
      }))
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    userMapping,
    loading,
    getUserName,
    fetchUser,
    fetchUsers
  }
}
