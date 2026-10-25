import { createContext, useContext, useState, useEffect } from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth } from '../firebase/firebase'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('olx_session_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [loading, setLoading] = useState(true)

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password)
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password)
  }

  function logout() {
    localStorage.removeItem('olx_session_user')
    return signOut(auth)
  }

  // Monitor user session state across refreshes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Save session in localStorage for immediate access
        localStorage.setItem(
          'olx_session_user',
          JSON.stringify({
            uid: user.uid,
            email: user.email
          })
        )
        setCurrentUser(user)
      } else {
        localStorage.removeItem('olx_session_user')
        setCurrentUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const value = {
    currentUser,
    loading,
    isAuthenticated: Boolean(currentUser),
    signup,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="session-loading-screen">
          <div className="session-spinner"></div>
          <p>Loading session...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  )
}

