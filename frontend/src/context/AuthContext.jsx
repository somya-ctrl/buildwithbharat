import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, userAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('codexa_token') || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function initAuth() {
      const storedToken = localStorage.getItem('codexa_token')
      if (storedToken) {
        try {
          const res = await authAPI.me()
          if (res.data && res.data.user) {
            setUser(res.data.user)
            setToken(storedToken)
          } else {
            localStorage.removeItem('codexa_token')
            setToken(null)
          }
        } catch (err) {
          console.error('Auth verification failed:', err)
          localStorage.removeItem('codexa_token')
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const signup = async (name, email, password) => {
    setError(null)
    setLoading(true)
    try {
      const res = await authAPI.signup({ name, email, password })
      const { user: userData, token: userToken } = res.data
      if (userToken) {
        localStorage.setItem('codexa_token', userToken)
        setToken(userToken)
      }
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Signup failed. Please try again.'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    setError(null)
    setLoading(true)
    try {
      const res = await authAPI.login({ email, password })
      const { user: userData, token: userToken } = res.data
      if (userToken) {
        localStorage.setItem('codexa_token', userToken)
        setToken(userToken)
      }
      setUser(userData)
      return { success: true, user: userData }
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || 'Invalid credentials. Please try again.'
      setError(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      localStorage.removeItem('codexa_token')
      setToken(null)
      setUser(null)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const res = await userAPI.updateProfile(profileData)
      setUser(res.data)
      return { success: true, user: res.data }
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed.'
      return { success: false, error: message }
    }
  }

  const clearError = () => setError(null)

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    loading,
    error,
    signup,
    login,
    logout,
    updateProfile,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
