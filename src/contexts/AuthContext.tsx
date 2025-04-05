import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { UserInfo } from '../services/authService'
import {
  getObjectFromCookie,
  removeCookie,
  setObjectInCookie,
} from '../utils/cookies'

// 更新 User 接口以匹配后端返回的 userInfo 结构
interface User extends UserInfo {
  createdAt?: string
}

interface AuthContextType {
  isAuthenticated: boolean
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
  updateUserInfo: (userInfo: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // 检查本地存储中是否有token和cookie中是否有用户信息，如果有则自动恢复登录状态
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    const userInfoFromCookie = getObjectFromCookie<User>('userInfo')

    if (token && userInfoFromCookie) {
      setIsAuthenticated(true)
      setUser(userInfoFromCookie)
    } else if (token) {
      // 仅有token但没有cookie中的用户信息，尝试从localStorage中获取旧的用户信息
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser)
          setIsAuthenticated(true)
          setUser(userData)
          // 将旧数据同步到cookie
          setObjectInCookie('userInfo', userData, 7)
        } catch (e) {
          // 解析失败，清除无效数据
          localStorage.removeItem('authToken')
          localStorage.removeItem('user')
          removeCookie('userInfo')
        }
      } else {
        // token存在但没有用户信息，清除token
        localStorage.removeItem('authToken')
      }
    }
  }, [])

  const login = (token: string, userData: User) => {
    // 存储token到localStorage
    localStorage.setItem('authToken', token)
    // 存储用户信息到localStorage和cookie
    localStorage.setItem('user', JSON.stringify(userData))
    setObjectInCookie('userInfo', userData, 7)

    setIsAuthenticated(true)
    setUser(userData)
  }

  const logout = () => {
    // 清除localStorage和cookie的认证信息
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    removeCookie('userInfo')

    setIsAuthenticated(false)
    setUser(null)
  }

  // 新增: 更新用户信息
  const updateUserInfo = (userInfo: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userInfo }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setObjectInCookie('userInfo', updatedUser, 7)
    }
  }

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, updateUserInfo }}
    >
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
