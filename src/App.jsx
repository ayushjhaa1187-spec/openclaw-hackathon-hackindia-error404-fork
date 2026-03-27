// App.jsx — routing only, zero UI here
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'sonner'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'
import ProtectedRoute from './components/layout/ProtectedRoute'
import RootLayout from './components/layout/RootLayout'
import Spinner from './components/ui/Spinner'

const Landing      = lazy(() => import('./pages/Landing'))
const Login        = lazy(() => import('./pages/Login'))
const Onboarding   = lazy(() => import('./pages/Onboarding'))
const Dashboard    = lazy(() => import('./pages/Dashboard'))
const Explore      = lazy(() => import('./pages/Explore'))
const SkillDetail  = lazy(() => import('./pages/SkillDetail'))
const Vault        = lazy(() => import('./pages/Vault'))
const Chat         = lazy(() => import('./pages/Chat'))
const Admin        = lazy(() => import('./pages/Admin'))
const Profile      = lazy(() => import('./pages/Profile'))
const UserProfile  = lazy(() => import('./pages/UserProfile'))
const Settings     = lazy(() => import('./pages/Settings'))
const Notifications = lazy(() => import('./pages/Notifications'))
const NotFound     = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<Spinner fullscreen />}>
          <Routes>
            {/* PUBLIC */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />

            {/* ONBOARDING — auth required, no navbar */}
            <Route path="/onboarding" element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            } />

            {/* APP — auth + onboarding completed */}
            <Route element={
              <ProtectedRoute requireOnboarding>
                <RootLayout />
              </ProtectedRoute>
            }>
              <Route path="/dashboard"             element={<Dashboard />} />
              <Route path="/explore"               element={<Explore />} />
              <Route path="/explore/skill/:skillId" element={<SkillDetail />} />
              <Route path="/vault"                 element={<Vault />} />
              <Route path="/chat"                  element={<Chat />} />
              <Route path="/chat/:conversationId"  element={<Chat />} />
              <Route path="/profile"               element={<Profile />} />
              <Route path="/profile/:userId"       element={<UserProfile />} />
              <Route path="/notifications"         element={<Notifications />} />
              <Route path="/settings"              element={<Settings />} />
            </Route>

            {/* ADMIN — auth + admin role */}
            <Route path="/admin" element={
              <ProtectedRoute requireRole="admin">
                <RootLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Admin />} />
            </Route>

            {/* FALLBACKS */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*"    element={<Navigate to="/404" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-right" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  )
}
