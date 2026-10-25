import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth()

  // Wait until session verification finishes
  if (loading) {
    return (
      <div className="session-loading-screen">
        <div className="session-spinner"></div>
        <p>Checking session...</p>
      </div>
    )
  }

  // If no user session found, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
