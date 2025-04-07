import {
  BellOutlined,
  LoginOutlined,
  LogoutOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  Layout,
  Tooltip,
  theme as antdTheme,
} from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'

const { Header: AntHeader } = Layout
const { useToken } = antdTheme

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { token } = useToken()
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  // 定义菜单项
  const menuItems: MenuProps['items'] = [
    {
      key: '1',
      icon: <UserOutlined />,
      label: (
        <a
          onClick={(e) => {
            e.preventDefault()
            navigate('/profile')
          }}
        >
          个人资料
        </a>
      ),
    },
    {
      key: '2',
      icon: <SettingOutlined />,
      label: (
        <a
          onClick={(e) => {
            e.preventDefault()
            navigate('/settings')
          }}
        >
          设置
        </a>
      ),
    },
    { type: 'divider' },
    {
      key: '3',
      icon: <LogoutOutlined />,
      label: (
        <a
          onClick={(e) => {
            e.preventDefault()
            logout()
            navigate('/')
          }}
        >
          退出登录
        </a>
      ),
    },
  ]

  // 处理登录按钮点击
  const handleLogin = () => {
    navigate('/login')
  }

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: token.colorBgContainer,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div>{/* Left side elements */}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {isAuthenticated && (
          <Input.Search
            placeholder="搜索..."
            style={{ width: 250 }}
          />
        )}

        {/* Theme Toggle Button */}
        <Tooltip title={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}>
          <Button
            shape="circle"
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
          />
        </Tooltip>

        {isAuthenticated ? (
          <>
            <Badge
              count={5}
              size="small"
            >
              <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
            </Badge>

            <Dropdown
              menu={{ items: menuItems }}
              trigger={['click']}
            >
              <a
                onClick={(e) => e.preventDefault()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                }}
              >
                <Avatar
                  size="small"
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  style={{ marginRight: 8 }}
                >
                  {!user?.avatar && user?.username?.slice(0, 1)?.toUpperCase()}
                </Avatar>
                <span>{user?.username || '用户'}</span>
              </a>
            </Dropdown>
          </>
        ) : (
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={handleLogin}
          >
            登录
          </Button>
        )}
      </div>
    </AntHeader>
  )
}

export default Header
