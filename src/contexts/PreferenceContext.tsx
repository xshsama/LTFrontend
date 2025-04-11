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
    const loadPreferences = async () => {
      try {
        const userPreferences = await getUserPreferences()
        setPreferences((prevPreferences) => ({
          ...prevPreferences,
          ...userPreferences,
        }))
      } catch (error) {
        console.error('加载用户偏好设置失败:', error)
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
