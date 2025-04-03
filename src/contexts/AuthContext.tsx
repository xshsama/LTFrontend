import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface User {
  username: string
  avatar?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // 检查本地存储中是否有token，如果有则自动恢复登录状态
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const storedUser = localStorage.getItem('user')

    if (token && storedUser) {
      try {
        setIsAuthenticated(true)
        setUser(JSON.parse(storedUser))
      } catch (e) {
        // 解析失败，清除无效数据
        localStorage.removeItem('authToken')
        localStorage.removeItem('user')
      }
    }
  }, [])

  const login = (token: string, userData: User) => {
    localStorage.setItem('authToken', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setIsAuthenticated(true)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setIsAuthenticated(false)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
