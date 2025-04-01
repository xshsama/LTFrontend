import React, {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextProps {
  theme: Theme
  toggleTheme: () => void
}

// Create the context with a default value (can be null or a default object)
export const ThemeContext = createContext<ThemeContextProps | null>(null)

interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize state, trying to read from localStorage first
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('appTheme') as Theme | null
    // Also check user's system preference
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    return storedTheme || (prefersDark ? 'dark' : 'light')
  })

  // Update localStorage and body class when theme changes
  useEffect(() => {
    localStorage.setItem('appTheme', theme)
    document.body.classList.remove('light', 'dark')
    document.body.classList.add(theme)
  }, [theme])

  // Function to toggle the theme
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({ theme, toggleTheme }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

// Custom hook for easier context usage (optional but recommended)
export const useTheme = (): ThemeContextProps => {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
