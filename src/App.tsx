import { ConfigProvider, Progress, theme as antdTheme } from 'antd' // Import ConfigProvider and theme
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext' // 导入AuthProvider
import {
  PreferenceProvider,
  usePreferences,
} from './contexts/PreferenceContext' // 导入PreferenceProvider
import { ThemeProvider, useTheme } from './contexts/ThemeContext' // Import ThemeProvider and useTheme
import MainLayout from './layouts/MainLayout'
// import Community from './pages/Community'; // Removed Community import
import Courses from './pages/Courses'
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage' // Import LoginPage
import Objectives from './pages/Objectives'
import ProfilePage from './pages/ProfilePage' // 导入个人资料页面
import RegisterPage from './pages/RegisterPage' // 导入注册页面
import Settings from './pages/Settings'
import TaskProgressPage from './pages/TaskProgressPage'

// Inner component to access theme context and preferences for ConfigProvider
const ThemedApp: React.FC = () => {
  const { theme } = useTheme() // Get theme from context
  const { preferences } = usePreferences() // Get preferences

  // 根据默认页面设置重定向
  const getDefaultRoute = () => {
    return preferences.defaultPage
      ? `/${preferences.defaultPage}`
      : '/dashboard'
  }

  return (
    <ConfigProvider
      theme={{
        // Use Ant Design's built-in dark or default algorithm based on context
        algorithm:
          theme === 'dark'
            ? antdTheme.darkAlgorithm
            : antdTheme.defaultAlgorithm,
        // You can customize tokens further here if needed
        // token: { colorPrimary: '#00b96b' },
      }}
    >
      {/* Routes are now top-level to handle different layouts */}
      <Routes>
        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/signup"
          element={<RegisterPage />}
        />
        {/* Wrap protected routes within a parent route using MainLayout */}
        <Route
          path="/*" // Match all other paths for the main app layout
          element={
            <MainLayout>
              <Routes>
                {/* Existing routes nested under MainLayout, use relative paths */}
                <Route
                  path="dashboard"
                  element={<Dashboard />}
                />
                <Route
                  path="objectives"
                  element={<Objectives />}
                />
                <Route
                  path="courses"
                  element={<Courses />}
                />
                <Route
                  path="progress"
                  element={<Progress />}
                />
                {/* <Route
                  path="community"
                  element={<Community />}
                /> */}
                <Route
                  path="profile"
                  element={<ProfilePage />}
                />
                <Route
                  path="settings"
                  element={<Settings />}
                />
                <Route
                  path="task-progress"
                  element={<TaskProgressPage />}
                />
                {/* Default redirect for authenticated area */}
                <Route
                  path="/"
                  element={
                    <Navigate
                      replace
                      to={getDefaultRoute()}
                    />
                  }
                />
                {/* Add a fallback for unmatched routes within MainLayout if needed */}
                {/* <Route path="*" element={<NotFoundPage />} /> */}
              </Routes>
            </MainLayout>
          }
        />
      </Routes>
    </ConfigProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PreferenceProvider>
          <Router>
            <ThemedApp />
          </Router>
        </PreferenceProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
