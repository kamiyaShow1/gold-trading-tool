import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import LearningPage from './pages/LearningPage'
import QuizPage from './pages/QuizPage'
import DemoTradePage from './pages/DemoTradePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/learning"
            element={
              <RequireAuth>
                <LearningPage />
              </RequireAuth>
            }
          />
          <Route
            path="/learning/:chapterId"
            element={
              <RequireAuth>
                <LearningPage />
              </RequireAuth>
            }
          />
          <Route
            path="/quiz/:quizId"
            element={
              <RequireAuth>
                <QuizPage />
              </RequireAuth>
            }
          />
          <Route
            path="/demo-trade"
            element={
              <RequireAuth>
                <DemoTradePage />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
