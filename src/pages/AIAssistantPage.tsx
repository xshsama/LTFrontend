// frontend/src/pages/AIAssistantPage.tsx
import {
  CheckCircleFilled, // Added for List item prefix
  ExperimentOutlined,
  ReadOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { Card, Empty, List, Space, Tabs, Typography } from 'antd'
import React from 'react'
import LearningReportPage from '../components/LearningReportPage'

const { Title, Paragraph, Text } = Typography // Added Text
const { TabPane } = Tabs

// Placeholder for the AI Helper sub-page
const AIHelperPlaceholder: React.FC = () => {
  return (
    <Card
      style={{
        textAlign: 'center',
        padding: '30px 15px',
        backgroundColor: '#f9fcff',
        borderRadius: '8px',
      }}
      bordered={false}
    >
      <Empty
        image={
          <ExperimentOutlined style={{ fontSize: 60, color: '#007bff' }} />
        }
        imageStyle={{ height: 70 }}
        description={
          <Space
            direction="vertical"
            size="middle"
          >
            <Title
              level={4}
              style={{ color: '#0056b3' }} // Darker blue for title
            >
              AI 辅助助手 (研发中)
            </Title>
            <Paragraph
              type="secondary"
              style={{ fontSize: '14px' }}
            >
              我们正在努力打造您的个性化AI学习伙伴！未来，它将能够帮助您：
            </Paragraph>
            <List
              size="small"
              itemLayout="horizontal"
              style={{
                textAlign: 'left',
                maxWidth: 420,
                margin: '0 auto',
                fontSize: '13px',
              }}
              dataSource={[
                '规划学习路径与制定目标',
                '解答学习过程中的疑难问题',
                '根据您的需求生成练习题目',
                '评估学习效果并提供反馈',
                '还有更多智能功能敬请期待...',
              ]}
              renderItem={(item: string) => (
                <List.Item style={{ borderBottom: '1px dashed #e8e8e8' }}>
                  <CheckCircleFilled
                    style={{ color: '#28a745', marginRight: '8px' }}
                  />{' '}
                  {item}
                </List.Item>
              )}
            />
            <Paragraph
              strong
              style={{ marginTop: '16px' }}
            >
              TODO: 实现 AI 辅助助手核心交互功能。
            </Paragraph>
          </Space>
        }
      >
        {/* <Button type="primary">敬请期待</Button> */}
      </Empty>
    </Card>
  )
}

const AIAssistantPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title
        level={2}
        style={{
          marginBottom: '28px',
          textAlign: 'center',
          color: '#0056b3', // Darker blue for main title
          fontWeight: 600,
        }}
      >
        AI 智能助手
      </Title>
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 6px 12px rgba(0, 70, 150, 0.1)', // Softer, bluer shadow
          borderRadius: '12px', // More rounded corners
          backgroundColor: '#ffffff', // Ensure card background is white if page bg changes
        }}
      >
        <Tabs
          defaultActiveKey="1"
          type="line"
          centered
          tabBarStyle={{ marginBottom: '20px' }} // Add some space below tab headers
          items={[
            {
              label: (
                <span style={{ color: '#007bff' }}>
                  {' '}
                  {/* Blue for tab icon and text */}
                  <ReadOutlined style={{ marginRight: '6px' }} />
                  学习报告总结
                </span>
              ),
              key: '1',
              children: (
                <div style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                  {' '}
                  {/* Adjusted padding */}
                  <LearningReportPage />
                </div>
              ),
            },
            {
              label: (
                <span style={{ color: '#007bff' }}>
                  {' '}
                  {/* Blue for tab icon and text */}
                  <RobotOutlined style={{ marginRight: '6px' }} />
                  AI 辅助 (敬请期待)
                </span>
              ),
              key: '2',
              children: <AIHelperPlaceholder />,
            },
          ]}
        />
      </Card>
    </div>
  )
}

export default AIAssistantPage
