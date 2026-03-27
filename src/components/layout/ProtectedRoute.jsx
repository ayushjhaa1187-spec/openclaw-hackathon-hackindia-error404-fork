import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import Spinner from '../ui/Spinner'

export default function ProtectedRoute({
  children,
  requireOnboarding = false,
  requireRole = null
}) {
  const { user, profile, loading } = useAuthStore()
  const location = useLocation()

  if (loading) return <Spinner fullscreen />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (requireOnboarding && profile && !profile.onboarding_completed)
    return <Navigate to="/onboarding" replace />
  if (requireRole && profile?.role !== requireRole)
    return <Navigate to="/dashboard" replace />
  return children
}
