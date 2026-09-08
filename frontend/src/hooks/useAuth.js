import { createContext, createElement, useCallback, useContext, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import api from '../services/api'

const AuthContext = createContext(null)

function readStoredAuth() {
  try {
    const token = localStorage.getItem('token')
    const userJson = localStorage.getItem('user')
    return { token, user: userJson ? JSON.parse(userJson) : null }
  } catch {
    return { token: null, user: null }
  }
}

function persistAuth({ token, userId, username }) {
  const user = { id: userId, username }
  localStorage.setItem('token', token)
  localStorage.setItem('user', JSON.stringify(user))
  return { token, user }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readStoredAuth)

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password })
    setAuth(persistAuth(data))
    return data
  }, [])

  const register = useCallback(async (username, email, password) => {
    const { data } = await api.post('/auth/register', { username, email, password })
    setAuth(persistAuth(data))
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth({ token: null, user: null })
  }, [])

  const value = {
    user: auth.user,
    token: auth.token,
    isAuthenticated: Boolean(auth.token),
    login,
    register,
    logout,
  }

  return createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth は AuthProvider の内側で使用してください')
  }
  return ctx
}

export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return createElement(Navigate, { to: '/login', state: { from: location }, replace: true })
  }

  return children
}
