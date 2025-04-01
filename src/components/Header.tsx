import {
  BellOutlined,
  LogoutOutlined,
  MoonOutlined,
  SettingOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Input,
  Layout,
  Menu,
  Tooltip,
  theme as antdTheme, // Import theme
} from 'antd'
import React from 'react'
import { useTheme } from '../contexts/ThemeContext'

const { Header: AntHeader } = Layout
const { useToken } = antdTheme // Destructure useToken hook

const menu = (
  <Menu
    items={[
      {
        key: '1',
        icon: <UserOutlined />,
        label: (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="#"
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
            target="_blank"
            rel="noopener noreferrer"
            href="/settings"
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
            target="_blank"
            rel="noopener noreferrer"
            href="#"
          >
            退出登录
          </a>
        ),
      },
    ]}
  />
)

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme()
  const { token } = useToken() // Get theme tokens

  return (
    <AntHeader
      // className="site-layout-background" // Class might not be needed
      style={{
        padding: '0 24px',
        background: token.colorBgContainer, // Use theme token for background
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: `1px solid ${token.colorBorderSecondary}`, // Use theme token for border
      }}
    >
      <div>{/* Left side elements */}</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Input.Search
          placeholder="搜索..."
          style={{ width: 250 }}
        />

        {/* Theme Toggle Button */}
        <Tooltip title={theme === 'dark' ? '切换到亮色主题' : '切换到暗色主题'}>
          <Button
            shape="circle"
            icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
            onClick={toggleTheme}
          />
        </Tooltip>

        <Badge
          count={5}
          size="small"
        >
          <BellOutlined style={{ fontSize: '18px', cursor: 'pointer' }} />
        </Badge>

        <Dropdown
          overlay={menu}
          trigger={['click']}
        >
          <a
            onClick={(e) => e.preventDefault()}
            style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          >
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ marginRight: 8 }}
            />
            <span>用户名</span>
          </a>
        </Dropdown>
      </div>
    </AntHeader>
  )
}

export default Header
