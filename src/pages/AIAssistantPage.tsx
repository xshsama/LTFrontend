// frontend/src/pages/AIAssistantPage.tsx
import { Card, Tabs, Typography } from 'antd'
import React from 'react'
import LearningReportPage from '../components/LearningReportPage' // Path confirmed from user's environment details

const { Title, Paragraph } = Typography // Added Paragraph
const { TabPane } = Tabs

// Placeholder for the AI Helper sub-page
const AIHelperPlaceholder: React.FC = () => {
  return (
    <Card>
      <Title level={4}>AI 辅助助手</Title>
      <Paragraph>
        此功能模块正在开发中。一个由AI驱动的智能助手将在这里帮助您完成学习任务、解答疑问并提供指导。
      </Paragraph>
      <Paragraph strong>TODO: 实现 AI 辅助助手功能。</Paragraph>
    </Card>
  )
}

const AIAssistantPage: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title
        level={2}
        style={{ marginBottom: '24px', textAlign: 'center' }}
      >
        AI 智能助手
      </Title>
      <Card
        variant="borderless" // Replaced deprecated bordered={false}
        style={{ boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
      >
        <Tabs
          defaultActiveKey="1"
          type="line" // Changed to line type for a cleaner look within a card
          centered
          items={[
            {
              label: '学习报告总结',
              key: '1',
              children: <LearningReportPage />, // This component should ideally not have its own full-page padding/title
            },
            {
              label: 'AI 辅助 (敬请期待)',
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
