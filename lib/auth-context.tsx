"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient, type User, type LoginCredentials } from "./api-client"

export type UserRole = "admin" | "partner"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for stored token and validate it
    const initAuth = async () => {
      const token = localStorage.getItem("access_token")
      if (token) {
        try {
          apiClient.setToken(token)
          const currentUser = await apiClient.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          console.error("Failed to validate token:", error)
          apiClient.clearToken()
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
      const currentUser = await apiClient.getCurrentUser()
      setUser(currentUser)
      return true
    } catch (error) {
      console.error("Login failed:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    apiClient.clearToken()
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
