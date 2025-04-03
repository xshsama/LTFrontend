import { LoginOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Input, Result, Space, Tabs, Typography } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ResourceList from '../components/ResourceList'
import { useAuth } from '../contexts/AuthContext'
import { Resource } from '../types/resource'

const { Title } = Typography
const { Search } = Input

const ResourcesPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [resources, setResources] = useState<Resource[]>([])

  // 处理登录按钮点击
  const handleLogin = () => {
    navigate('/login')
  }

  const handleSearch = (value: string) => {
    console.log('Search:', value)
    // 实现搜索逻辑
  }

  // 如果未登录，显示提示信息
  if (!isAuthenticated) {
    return (
      <div className="resources-container">
        <Result
          status="info"
          title="学习资源库"
          subTitle="登录后可访问和管理您的学习资源"
          extra={
            <Button
              type="primary"
              icon={<LoginOutlined />}
              onClick={handleLogin}
            >
              立即登录
            </Button>
          }
        />
      </div>
    )
  }

  const tabItems = [
    {
      key: 'all',
      label: '全部资源',
      children: (
        <ResourceList
          resources={resources}
          loading={loading}
        />
      ),
    },
    {
      key: 'courses',
      label: '课程资源',
      children: (
        <ResourceList
          resources={resources.filter((r: Resource) => r.type === 'course')}
          loading={loading}
        />
      ),
    },
    {
      key: 'articles',
      label: '文章资源',
      children: (
        <ResourceList
          resources={resources.filter((r: Resource) => r.type === 'article')}
          loading={loading}
        />
      ),
    },
    {
      key: 'videos',
      label: '视频资源',
      children: (
        <ResourceList
          resources={resources.filter((r: Resource) => r.type === 'video')}
          loading={loading}
        />
      ),
    },
  ]

  return (
    <div className="resources-container">
      <div className="resources-header">
        <Title
          level={2}
          style={{ marginBottom: 0 }}
        >
          学习资源库
        </Title>
        <Space>
          <Search
            placeholder="搜索资源..."
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
          >
            添加资源
          </Button>
        </Space>
      </div>
      <Tabs
        defaultActiveKey="all"
        items={tabItems}
      />
    </div>
  )
}

export default ResourcesPage
