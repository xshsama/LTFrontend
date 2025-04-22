import React, { createContext, ReactNode, useEffect, useState } from 'react'
import {
  getUserPreferences,
  updateUserPreferences,
  UserPreference,
} from '../services/preferenceService'

interface PreferenceContextProps {
  preferences: UserPreference
  updatePreferences: (newPreferences: Partial<UserPreference>) => Promise<void>
}

export const PreferenceContext = createContext<PreferenceContextProps | null>(
  null,
)

interface PreferenceProviderProps {
  children: ReactNode
}

export const PreferenceProvider: React.FC<PreferenceProviderProps> = ({
  children,
}) => {
  const [preferences, setPreferences] = useState<UserPreference>({
    theme: 'light',
    emailNotifications: false,
    taskReminderFrequency: 'never',
    communityUpdatesEnabled: false,
    achievementNotificationsEnabled: false,
    defaultPage: 'dashboard',
    fixedSidebarEnabled: false,
    language: 'zh-CN',
  })

  // 初始化时加载用户偏好设置
  useEffect(() => {
    const loadPreferences = async (retryCount = 0) => {
      const token = localStorage.getItem('authToken')
      console.log('加载偏好设置 - 当前令牌:', token)

      if (!token) {
        console.warn('未找到认证令牌，跳过偏好设置加载')
        return
      }

      try {
        const userPreferences = await getUserPreferences()
        setPreferences((prevPreferences) => ({
          ...prevPreferences,
          ...userPreferences,
        }))
      } catch (error) {
        console.error('加载用户偏好设置失败:', error)
        // 如果失败但令牌存在，重试最多3次
        if (retryCount < 3 && localStorage.getItem('authToken')) {
          console.log(`重试加载偏好设置 (${retryCount + 1}/3)`)
          setTimeout(() => loadPreferences(retryCount + 1), 1000)
        }
      }
    }

    loadPreferences()
  }, [])

  // 更新偏好设置
  const updatePreferences = async (newPreferences: Partial<UserPreference>) => {
    try {
      const updatedPreferences = await updateUserPreferences(newPreferences)
      setPreferences((prev) => ({
        ...prev,
        ...updatedPreferences,
      }))
    } catch (error) {
      console.error('更新偏好设置失败:', error)
      throw error
    }
  }

  return (
    <PreferenceContext.Provider value={{ preferences, updatePreferences }}>
      {children}
    </PreferenceContext.Provider>
  )
}

// 自定义 hook
export const usePreferences = (): PreferenceContextProps => {
  const context = React.useContext(PreferenceContext)
  if (!context) {
    throw new Error('usePreferences must be used within a PreferenceProvider')
  }
  return context
}
