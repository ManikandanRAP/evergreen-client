"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient, type User, type LoginCredentials } from "./api-client"

export type UserRole = "admin" | "partner" | "internal"

interface AuthContextType {
  user: User | null
  token: string | null // Expose token in the context
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null) // Add state for the token
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token and validate it on initial load
    const initAuth = async () => {
      const storedToken = localStorage.getItem("access_token")
      if (storedToken) {
        try {
          apiClient.setToken(storedToken)
          const currentUser = await apiClient.getCurrentUser()
          setUser(currentUser)
          setToken(storedToken) // Set the token in state
        } catch (error) {
          console.error("Failed to validate token:", error)
          apiClient.clearToken()
          localStorage.removeItem("access_token")
          setToken(null)
        }
      }
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const credentials: LoginCredentials = {
        username: email, // API uses username field for email
        password,
      }

      await apiClient.login(credentials)
      const newToken = localStorage.getItem("access_token") // Get token after login
      const currentUser = await apiClient.getCurrentUser()
      setUser(currentUser)
      setToken(newToken) // Set the new token in state
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null) // Clear token from state
    apiClient.clearToken()
    localStorage.removeItem("access_token")
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}