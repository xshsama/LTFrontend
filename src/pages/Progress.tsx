import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  LoginOutlined,
  RiseOutlined,
} from '@ant-design/icons'
import {
  Progress as AntProgress,
  Button,
  Card,
  Col,
  Divider,
  Result,
  Row,
  Statistic,
  Typography,
} from 'antd'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography

const Progress: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // 处理登录按钮点击
  const handleLogin = () => {
    navigate('/login')
  }

  // 如果未登录，显示提示信息
  if (!isAuthenticated) {
    return (
      <div style={{ padding: '24px 0' }}>
        <Result
          status="info"
          title="查看学习进度"
          subTitle="登录后可查看您的学习进度分析和学习报告"
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

  return (
    <div>
      <Title
        level={2}
        style={{ marginBottom: '24px' }}
      >
        学习进度与分析
      </Title>

      {/* Overall Progress and Stats */}
      <Row
        gutter={[16, 16]}
        style={{ marginBottom: '24px' }}
      >
        <Col
          xs={24}
          md={8}
        >
          <Card
            title="总进度概览"
            styles={{ body: { padding: '20px' } }}
          >
            {/* Example overall progress */}
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <AntProgress
                type="dashboard"
                percent={65}
              />
              <Text
                style={{ display: 'block', marginTop: '8px' }}
                strong
              >
                整体学习进度
              </Text>
            </div>
            <Divider />
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="已完成目标"
                  value={8}
                  prefix={<CheckCircleOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="进行中目标"
                  value={4}
                />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col
          xs={24}
          md={8}
        >
          <Card
            title="时间投入分析"
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title="本周总学习时长"
              value={15.2}
              precision={1}
              prefix={<ClockCircleOutlined />}
              suffix="小时"
            />
            <Statistic
              title="平均每日时长"
              value={2.1}
              precision={1}
              valueStyle={{ fontSize: '16px', color: '#8c8c8c' }}
              prefix={<ClockCircleOutlined />}
              suffix="小时"
              style={{ marginTop: '16px' }}
            />
            {/* Placeholder for time distribution chart */}
            <div style={{ marginTop: '24px', color: '#8c8c8c' }}>
              时间分布图表区域...
            </div>
          </Card>
        </Col>
        <Col
          xs={24}
          md={8}
        >
          <Card
            title="效率与趋势"
            styles={{ body: { padding: '20px' } }}
          >
            <Statistic
              title="任务完成率 (本月)"
              value={88}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<RiseOutlined />}
              suffix="%"
            />
            <Statistic
              title="平均任务耗时"
              value={1.5}
              precision={1}
              valueStyle={{ fontSize: '16px', color: '#8c8c8c' }}
              prefix={<ClockCircleOutlined />}
              suffix="小时/任务"
              style={{ marginTop: '16px' }}
            />
            {/* Placeholder for efficiency trend chart */}
            <div style={{ marginTop: '24px', color: '#8c8c8c' }}>
              效率趋势图表区域...
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detailed Reports Section */}
      <Card
        title="详细学习报告"
        styles={{ body: { padding: '20px' } }}
      >
        <p>这里可以生成或展示更详细的学习报告，例如按课程、按时间段等。</p>
        <Button type="link">生成周报</Button>
        <Button type="link">生成月报</Button>
      </Card>
    </div>
  )
}

export default Progress
