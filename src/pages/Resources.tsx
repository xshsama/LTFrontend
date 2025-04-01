import {
  BookOutlined,
  FilePdfOutlined,
  LinkOutlined,
  PlusOutlined,
  StarFilled,
  StarOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Input,
  List,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import React from 'react'

const { Title, Paragraph } = Typography
const { Search } = Input
const { TabPane } = Tabs

// Example data structure for resources
interface Resource {
  id: string
  type: 'pdf' | 'link' | 'video' | 'note'
  title: string
  description: string
  source: string // URL or path
  tags: string[]
  isFavorite: boolean
}

const resourceData: Resource[] = [
  {
    id: '1',
    type: 'pdf',
    title: 'React 官方文档 (PDF)',
    description: '官方 React 文档的离线版本',
    source: '/path/to/react-docs.pdf',
    tags: ['React', '官方文档'],
    isFavorite: true,
  },
  {
    id: '2',
    type: 'link',
    title: 'MDN Web Docs',
    description: '权威的 Web 开发文档',
    source: 'https://developer.mozilla.org/',
    tags: ['Web', '文档', '权威'],
    isFavorite: false,
  },
  {
    id: '3',
    type: 'video',
    title: 'Ant Design 入门教程',
    description: 'Bilibili 上的 Antd 视频教程',
    source: 'https://www.bilibili.com/video/BV...',
    tags: ['Antd', '视频教程', 'UI'],
    isFavorite: true,
  },
  {
    id: '4',
    type: 'note',
    title: '关于 Hooks 的笔记',
    description: '学习 React Hooks 时的个人笔记',
    source: '/notes/hooks',
    tags: ['React', 'Hooks', '笔记'],
    isFavorite: false,
  },
  {
    id: '5',
    type: 'link',
    title: 'TypeScript Handbook',
    description: 'TypeScript 官方手册',
    source: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    tags: ['TypeScript', '官方文档'],
    isFavorite: false,
  },
]

// Function to get icon based on resource type
const getIcon = (type: Resource['type']) => {
  switch (type) {
    case 'pdf':
      return <FilePdfOutlined style={{ color: '#ff4d4f' }} />
    case 'link':
      return <LinkOutlined style={{ color: '#1890ff' }} />
    case 'video':
      return <VideoCameraOutlined style={{ color: '#faad14' }} />
    case 'note':
      return <BookOutlined style={{ color: '#722ed1' }} />
    default:
      return <BookOutlined />
  }
}

const Resources: React.FC = () => {
  // Add state and handlers for search, filter, favorite later
  const handleSearch = (value: string) => {
    console.log('Search:', value)
    // Implement search logic
  }

  const handleFavoriteToggle = (id: string) => {
    console.log('Toggle favorite:', id)
    // Implement favorite toggle logic
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
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

      <Tabs defaultActiveKey="all">
        <TabPane
          tab="所有资源"
          key="all"
        >
          <List
            itemLayout="horizontal"
            dataSource={resourceData}
            renderItem={(item) => (
              <List.Item
                actions={[
                  <Tooltip title={item.isFavorite ? '取消收藏' : '收藏'}>
                    <Button
                      shape="circle"
                      icon={
                        item.isFavorite ? (
                          <StarFilled style={{ color: '#faad14' }} />
                        ) : (
                          <StarOutlined />
                        )
                      }
                      onClick={() => handleFavoriteToggle(item.id)}
                    />
                  </Tooltip>,
                  <Button type="link">编辑</Button>, // Add edit functionality
                  <Button
                    type="link"
                    danger
                  >
                    删除
                  </Button>, // Add delete functionality
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      shape="square"
                      size="large"
                      icon={getIcon(item.type)}
                    />
                  }
                  title={
                    <a
                      href={item.source}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.title}
                    </a>
                  }
                  description={
                    <>
                      <Paragraph
                        ellipsis={{ rows: 2 }}
                        style={{ marginBottom: '8px' }}
                      >
                        {item.description}
                      </Paragraph>
                      <div>
                        {item.tags.map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane
          tab="文档/笔记"
          key="docs"
        >
          {/* Filtered list for docs/notes */}
          <List
            dataSource={resourceData.filter(
              (r) => r.type === 'pdf' || r.type === 'note',
            )}
            renderItem={(item) => <List.Item>{item.title}</List.Item>}
          />
        </TabPane>
        <TabPane
          tab="链接"
          key="links"
        >
          {/* Filtered list for links */}
          <List
            dataSource={resourceData.filter((r) => r.type === 'link')}
            renderItem={(item) => <List.Item>{item.title}</List.Item>}
          />
        </TabPane>
        <TabPane
          tab="视频"
          key="videos"
        >
          {/* Filtered list for videos */}
          <List
            dataSource={resourceData.filter((r) => r.type === 'video')}
            renderItem={(item) => <List.Item>{item.title}</List.Item>}
          />
        </TabPane>
        <TabPane
          tab="收藏夹"
          key="favorites"
        >
          {/* Filtered list for favorites */}
          <List
            dataSource={resourceData.filter((r) => r.isFavorite)}
            renderItem={(item) => <List.Item>{item.title}</List.Item>}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default Resources
