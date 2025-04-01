import { Layout, theme as antdTheme } from 'antd' // Import theme
import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'

const { Content } = Layout
const { useToken } = antdTheme // Destructure useToken hook

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { token } = useToken() // Get theme tokens

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout>
        <Header />{' '}
        {/* Header will get its background from useToken inside its own component */}
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: token.colorBgContainer, // Use theme token for background
            borderRadius: token.borderRadiusLG, // Optional: Add border radius consistent with theme
          }}
        >
          {/*
            Antd Content component provides basic structure.
            We might add more specific styling or components here later.
            The background: '#fff' gives content area a white background typical in dashboards.
            Adjust margin/padding as needed.
          */}
          {children}
        </Content>
        {/* We could add an Antd Footer here if needed:
        <Footer style={{ textAlign: 'center' }}>
          Learning Tracker ©{new Date().getFullYear()}
        </Footer>
        */}
      </Layout>
    </Layout>
  )
}

export default MainLayout
