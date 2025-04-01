import {
  LikeOutlined,
  MessageOutlined,
  PlusOutlined,
  StarOutlined,
} from '@ant-design/icons'
import { Avatar, Button, Input, List, Space, Tag, Typography } from 'antd'
import React from 'react'

const { Title, Paragraph } = Typography
const { Search } = Input

// Example data for community posts
const communityData = [
  {
    id: '1',
    author: '学习达人A',
    avatar: 'https://joeschmoe.io/api/v1/random', // Placeholder avatar
    title: '关于 React Hooks 的最佳实践讨论',
    content:
      '大家在项目中都怎么使用 React Hooks 的？有什么推荐的最佳实践或者需要避免的坑吗？一起来讨论下吧！',
    tags: ['React', 'Hooks', '最佳实践'],
    likes: 15,
    comments: 5,
    timestamp: '2小时前',
  },
  {
    id: '2',
    author: '前端小萌新',
    avatar: 'https://joeschmoe.io/api/v1/female/random',
    title: '求助：Ant Design Table 如何实现复杂表头？',
    content:
      '我想实现一个多级表头，但是官方文档看得不是很明白，有没有大佬能指点一下？',
    tags: ['Antd', 'Table', '求助'],
    likes: 3,
    comments: 2,
    timestamp: '5小时前',
  },
  {
    id: '3',
    author: '设计爱好者',
    avatar: 'https://joeschmoe.io/api/v1/male/random',
    title: '分享一个不错的 UI 设计资源网站',
    content: '最近发现一个很棒的 UI 设计灵感网站，分享给大家：[链接]',
    tags: ['UI', '设计', '资源分享'],
    likes: 28,
    comments: 8,
    timestamp: '昨天',
  },
]

// IconText component for actions like like, comment
const IconText = ({
  icon,
  text,
}: {
  icon: React.FC
  text: string | number
}) => (
  <Space>
    {React.createElement(icon)}
    {text}
  </Space>
)

const Community: React.FC = () => {
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
          学习交流社区
        </Title>
        <Space>
          <Search
            placeholder="搜索帖子..."
            style={{ width: 300 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
          >
            发布新帖
          </Button>
        </Space>
      </div>

      {/* Can add Tabs here for different sections like '最新', '热门', '我的帖子' */}

      <List
        itemLayout="vertical"
        size="large"
        dataSource={communityData}
        renderItem={(item) => (
          <List.Item
            key={item.id}
            actions={[
              <IconText
                icon={LikeOutlined}
                text={item.likes}
                key="list-vertical-like-o"
              />,
              <IconText
                icon={MessageOutlined}
                text={item.comments}
                key="list-vertical-message"
              />,
              <IconText
                icon={StarOutlined}
                text="收藏"
                key="list-vertical-star-o"
              />, // Placeholder for favorite/bookmark
            ]}
            // extra={ // Optional: Add image preview if posts have images
            //   <img
            //     width={272}
            //     alt="logo"
            //     src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png"
            //   />
            // }
          >
            <List.Item.Meta
              avatar={<Avatar src={item.avatar} />}
              title={<a href={`/community/post/${item.id}`}>{item.title}</a>} // Link to post detail later
              description={`发布者: ${item.author} - ${item.timestamp}`}
            />
            <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: '展开' }}>
              {item.content}
            </Paragraph>
            <div>
              {item.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </List.Item>
        )}
      />
    </div>
  )
}

export default Community
