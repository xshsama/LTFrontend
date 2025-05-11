// frontend/src/components/LearningReportPage.tsx
import {
  AimOutlined, // Added icons
  BarChartOutlined,
  CarryOutOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  ProjectOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext' // Assuming you have an AuthContext to get userId
import { getLearningReport } from '../services/reportService'
import {
  LearningReport,
  RecentActivityItem,
  SubjectReportStats,
} from '../types/report'

const { Title, Paragraph, Text } = Typography
const { RangePicker } = DatePicker

const LearningReportPage: React.FC = () => {
  const { user } = useAuth() // Get current user
  const [report, setReport] = useState<LearningReport | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ])

  const fetchReport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1] || !user) {
      setError('请选择有效的日期范围并确保您已登录。')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
        userId: user.id, // Pass current user's ID
      }
      const data = await getLearningReport(params)
      setReport(data)
    } catch (err: any) {
      setError(err.message || '加载报告失败。')
      setReport(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch report on initial load or when user/dateRange changes
  useEffect(() => {
    if (user && dateRange[0] && dateRange[1]) {
      fetchReport()
    }
  }, [user, dateRange])

  const handleDateChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (dates) {
      setDateRange(dates)
    }
  }

  const renderOverallStats = (stats: LearningReport['overallStats']) => (
    <Card
      title={
        <Space>
          <BarChartOutlined style={{ color: '#1677ff' }} />
          整体统计
        </Space>
      }
      style={{ marginBottom: 24 }}
      variant="outlined"
    >
      <Row gutter={[16, 16]}>
        <Col
          xs={12}
          sm={12}
          md={6}
        >
          <Statistic
            title="总目标数"
            value={stats.totalGoals}
            prefix={<AimOutlined style={{ color: '#1677ff' }} />}
          />
        </Col>
        <Col
          xs={12}
          sm={12}
          md={6}
        >
          <Statistic
            title="已完成目标"
            value={stats.completedGoals}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Col>
        <Col
          xs={12}
          sm={12}
          md={6}
        >
          <Statistic
            title="总任务数"
            value={stats.totalTasks}
            prefix={<CarryOutOutlined style={{ color: '#1677ff' }} />}
          />
        </Col>
        <Col
          xs={12}
          sm={12}
          md={6}
        >
          <Statistic
            title="已完成任务"
            value={stats.completedTasks}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Col>
      </Row>
    </Card>
  )

  const renderSubjectStats = (subjectStats: SubjectReportStats[]) => (
    <Card
      title={
        <Space>
          <ProjectOutlined style={{ color: '#1677ff' }} />
          各学科进展
        </Space>
      }
      style={{ marginBottom: 24 }}
      variant="outlined"
    >
      <List
        itemLayout="horizontal"
        dataSource={subjectStats}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={<Text strong>{item.subjectTitle}</Text>}
              description={`目标: ${item.completedGoals}/${item.totalGoals} | 任务: ${item.completedTasks}/${item.totalTasks}`}
            />
          </List.Item>
        )}
      />
    </Card>
  )

  const renderRecentActivities = (activities: RecentActivityItem[]) => (
    <Card
      title={
        <Space>
          <HistoryOutlined style={{ color: '#1677ff' }} />
          近期活动
        </Space>
      }
      style={{ marginBottom: 24 }}
      variant="outlined"
    >
      <List
        itemLayout="horizontal"
        dataSource={activities}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta
              title={
                <Text strong>
                  {item.type === 'GOAL' ? (
                    <AimOutlined style={{ marginRight: 8, color: '#1677ff' }} />
                  ) : (
                    <CarryOutOutlined
                      style={{ marginRight: 8, color: '#13c2c2' }}
                    />
                  )}
                  {item.title}{' '}
                  <Tag color={item.type === 'GOAL' ? 'blue' : 'cyan'}>
                    {item.type === 'GOAL' ? '目标' : '任务'}
                  </Tag>
                </Text>
              }
              description={`状态: ${item.status} 日期: ${dayjs(
                item.date,
              ).format('YYYY-MM-DD')}`}
            />
          </List.Item>
        )}
      />
    </Card>
  )

  // Placeholder for chart rendering
  // const renderTasksOverTimeChart = (data: ChartDataPoint[]) => (
  //   <Card title="Tasks Completed Over Time" style={{ marginBottom: 24 }}>
  //     {/* Chart component would go here, e.g., using Ant Design Charts or another library */}
  //     <Paragraph>Chart for tasks completed over time (data points: {data.length})</Paragraph>
  //   </Card>
  // );

  const renderAISummary = (summary: string) => (
    <Card
      title={
        <Space>
          <RobotOutlined style={{ color: '#1677ff' }} />
          AI总结与建议
        </Space>
      }
      style={{ marginBottom: 24 }}
      variant="outlined"
    >
      <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{summary}</Paragraph>
    </Card>
  )

  return (
    // Removed outer div with padding and page-level Title/Paragraph,
    // as this component is now meant to be embedded.
    // The parent component (AIAssistantPage or a standalone LearningReportPage) will handle overall page layout.
    <Space
      direction="vertical"
      size="large"
      style={{ width: '100%' }}
    >
      <Space>
        <RangePicker // Consider adding locale for RangePicker if AntD supports it
          value={dateRange}
          onChange={handleDateChange}
          placeholder={['开始日期', '结束日期']}
        />
        <Button
          type="primary"
          onClick={fetchReport}
          loading={loading}
        >
          生成报告
        </Button>
      </Space>

      {loading && <Spin size="large" />}

      {error && (
        <Alert
          message="错误"
          description={error}
          type="error"
          showIcon
        />
      )}

      {report && !loading && !error && (
        <>
          <Paragraph>
            用户 <Text strong>{user?.username || '用户'}</Text> 的报告，范围从{' '}
            <Text strong>{report.reportStartDate}</Text> 到{' '}
            <Text strong>{report.reportEndDate}</Text>。 生成于：{' '}
            <Text code>
              {dayjs(report.generatedAt).format('YYYY-MM-DD HH:mm:ss')}
            </Text>
          </Paragraph>

          {renderOverallStats(report.overallStats)}
          {report.subjectStats &&
            report.subjectStats.length > 0 &&
            renderSubjectStats(report.subjectStats)}
          {report.recentActivities &&
            report.recentActivities.length > 0 &&
            renderRecentActivities(report.recentActivities)}
          {/* {report.tasksCompletedOverTime && report.tasksCompletedOverTime.length > 0 && renderTasksOverTimeChart(report.tasksCompletedOverTime)} */}
          {report.aiSummary && renderAISummary(report.aiSummary)}
        </>
      )}

      {!report && !loading && !error && (
        <Empty
          description="暂无报告数据，请选择日期范围并点击“生成报告”按钮。"
          style={{ marginTop: 40 }}
          image={Empty.PRESENTED_IMAGE_SIMPLE} // Pass the constant directly
        />
      )}
    </Space>
  )
}

export default LearningReportPage
