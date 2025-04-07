import {
  AimOutlined,
  BarChartOutlined,
  BookOutlined,
  FolderOutlined,
  PieChartOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
// No longer need: import '../styles/Sidebar.css'

const { Sider } = Layout

// Define menu items structure for Antd Menu
const menuItems = [
  {
    key: '/dashboard',
    icon: <PieChartOutlined />,
    label: <Link to="/dashboard">仪表盘</Link>,
  },
  {
    key: '/objectives', // Updated key
    icon: <AimOutlined />, // Keep goal icon or choose a combined one like UnorderedListOutlined
    label: <Link to="/objectives">目标与任务</Link>, // Updated label and link
  },
  // Removed Tasks menu item
  {
    key: '/courses',
    icon: <BookOutlined />,
    label: <Link to="/courses">课程/科目</Link>,
  },
  {
    key: '/progress',
    icon: <BarChartOutlined />,
    label: <Link to="/progress">学习进度</Link>,
  },
  {
    key: '/resources',
    icon: <FolderOutlined />,
    label: <Link to="/resources">学习资源</Link>,
  },
  {
    key: '/community',
    icon: <TeamOutlined />,
    label: <Link to="/community">社区</Link>,
  },
  // 已移除设置菜单项
]

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation() // Get current location

  // Determine the selected key based on the current path
  // Find the menu item whose key matches the start of the current pathname
  // Need to handle the new '/objectives' path correctly
  const currentKey =
    menuItems.find((item) => location.pathname.startsWith(item.key))?.key ||
    '/dashboard'

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
    >
      <div
        style={{
          height: '32px',
          margin: '16px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        {/* Placeholder for Logo - replace with actual logo later */}
        {collapsed ? 'LT' : '学习追踪器'}
      </div>
      <Menu
        theme="dark"
        selectedKeys={[currentKey]} // Set selected key based on current route
        mode="inline"
        items={menuItems}
      />
    </Sider>
  )
}

export default Sidebar
