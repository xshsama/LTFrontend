import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { setLogoutHandler } from '../services/apiService'
import { UserInfo } from '../services/authService'
import { getUserProfile } from '../services/profileService'
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
  loading: boolean // 添加加载状态
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // 添加loading状态来跟踪身份验证过程

  // 登出函数
  const logout = () => {
    // 清除localStorage和cookie的认证信息
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    removeCookie('userInfo')

    setIsAuthenticated(false)
    setUser(null)
  }

  // 注册登出处理函数到apiService
  useEffect(() => {
    // 将登出函数注册到API服务，这样token过期时可以调用
    setLogoutHandler(logout)
  }, [])

  // 从后端获取用户信息的函数
  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      const userProfile = await getUserProfile()
      // 将获取的用户信息保存到本地存储和cookie
      localStorage.setItem('user', JSON.stringify(userProfile))
      setObjectInCookie('userInfo', userProfile, 7)
      return userProfile as User
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 认证失败，清理无效令牌
      localStorage.removeItem('authToken')
      return null
    }
  }

  // 检查本地存储中是否有token和cookie中是否有用户信息，如果有则自动恢复登录状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true) // 开始检查认证状态时设置loading为true

      const token = localStorage.getItem('authToken')
      if (!token) {
        setLoading(false) // 没有token，直接结束加载
        return
      }

      // 尝试从cookie中获取用户信息
      const userInfoFromCookie = getObjectFromCookie<User>('userInfo')

      if (userInfoFromCookie) {
        // cookie中有用户信息，直接使用
        setIsAuthenticated(true)
        setUser(userInfoFromCookie)
        setLoading(false)
      } else {
        // cookie中没有用户信息，尝试从localStorage读取
        const storedUser = localStorage.getItem('user')

        if (storedUser) {
          try {
            // localStorage中有用户信息
            const userData = JSON.parse(storedUser)
            setIsAuthenticated(true)
            setUser(userData)
            // 同步到cookie
            setObjectInCookie('userInfo', userData, 7)
            setLoading(false)
          } catch (e) {
            // 解析失败，尝试从后端获取
            const userProfile = await fetchUserProfile(token)

            if (userProfile) {
              setIsAuthenticated(true)
              setUser(userProfile)
            } else {
              // 获取用户信息失败，清除认证状态
              logout()
            }
            setLoading(false)
          }
        } else {
          // localStorage中也没有用户信息，直接从后端获取
          const userProfile = await fetchUserProfile(token)

          if (userProfile) {
            setIsAuthenticated(true)
            setUser(userProfile)
          } else {
            // 获取用户信息失败，清除认证状态
            logout()
          }
          setLoading(false)
        }
      }
    }

    checkAuthStatus()
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

  // 更新用户信息
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
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        updateUserInfo,
        loading, // 暴露loading状态给组件
      }}
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
