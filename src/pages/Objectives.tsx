import { LoginOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Modal, Result, Space, Tabs, Typography, message } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import GoalForm from '../components/forms/GoalForm'
import TaskForm from '../components/forms/TaskForm'
import AchievementsTable from '../components/tables/AchievementsTable'
import GoalsTable from '../components/tables/GoalsTable'
import TasksTable from '../components/tables/TasksTable'
import { useAuth } from '../contexts/AuthContext'
import { mockAchievementData, mockGoalData, mockTaskData } from '../mock/data'
import { Achievement, Goal, Task } from '../types/goals'

const { Title } = Typography

const ObjectivesPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(false)
  const [goals, setGoals] = useState<Goal[]>(mockGoalData)
  const [tasks, setTasks] = useState<Task[]>(mockTaskData)
  const [achievements, setAchievements] =
    useState<Achievement[]>(mockAchievementData)
  const navigate = useNavigate()

  // 添加新的状态变量，用于控制模态框的显示
  const [goalModalVisible, setGoalModalVisible] = useState(false)
  const [taskModalVisible, setTaskModalVisible] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  // 处理登录按钮点击
  const handleLogin = () => {
    navigate('/login')
  }

  // 处理添加目标的逻辑
  const handleAddGoal = () => {
    setGoalModalVisible(true)
  }

  // 处理添加任务的逻辑
  const handleAddTask = () => {
    setTaskModalVisible(true)
  }

  // 处理目标表单提交
  const handleGoalFormSubmit = async (values: Omit<Goal, 'id' | 'key'>) => {
    setFormSubmitting(true)
    try {
      // 在实际应用中，这里应该调用 API 来保存数据
      // 这里为了演示，我们直接在前端模拟添加
      const newGoal: Goal = {
        ...values,
        id: uuidv4(),
        key: uuidv4(),
      }

      // 更新状态
      setGoals([newGoal, ...goals])

      // 关闭模态框
      setGoalModalVisible(false)
      message.success('学习目标添加成功！')
    } catch (error) {
      console.error('添加目标失败:', error)
      message.error('添加目标失败，请重试！')
    } finally {
      setFormSubmitting(false)
    }
  }

  // 处理任务表单提交
  const handleTaskFormSubmit = async (values: Omit<Task, 'key'>) => {
    setFormSubmitting(true)
    try {
      // 在实际应用中，这里应该调用 API 来保存数据
      // 这里为了演示，我们直接在前端模拟添加
      const newTask: Task = {
        ...values,
        key: uuidv4(),
      }

      // 更新状态
      setTasks([newTask, ...tasks])

      // 关闭模态框
      setTaskModalVisible(false)
      message.success('任务添加成功！')
    } catch (error) {
      console.error('添加任务失败:', error)
      message.error('添加任务失败，请重试！')
    } finally {
      setFormSubmitting(false)
    }
  }

  // 如果未登录，显示提示信息
  if (!isAuthenticated) {
    return (
      <div className="objectives-container">
        <Result
          status="info"
          title="请先登录"
          subTitle="登录后即可查看和管理您的学习目标、任务和成就"
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
      key: 'goals',
      label: '学习目标',
      children: (
        <GoalsTable
          data={goals}
          loading={loading}
        />
      ),
    },
    {
      key: 'tasks',
      label: '任务清单',
      children: (
        <TasksTable
          data={tasks}
          loading={loading}
        />
      ),
    },
    {
      key: 'achievements',
      label: '完成情况',
      children: (
        <AchievementsTable
          data={achievements}
          loading={loading}
        />
      ),
    },
  ]

  return (
    <div className="objectives-container">
      <div className="objectives-header">
        <Title
          level={2}
          style={{ marginBottom: 0 }}
        >
          目标与任务
        </Title>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddGoal}
          >
            添加目标
          </Button>
          <Button
            icon={<PlusOutlined />}
            onClick={handleAddTask}
          >
            添加任务
          </Button>
        </Space>
      </div>
      <Tabs
        defaultActiveKey="goals"
        items={tabItems}
        style={{ marginTop: '24px' }}
      />

      {/* 添加目标的模态框 */}
      <Modal
        title="添加学习目标"
        open={goalModalVisible}
        onCancel={() => setGoalModalVisible(false)}
        footer={null}
        destroyOnClose={true}
        maskClosable={false}
      >
        <GoalForm
          onFinish={handleGoalFormSubmit}
          onCancel={() => setGoalModalVisible(false)}
          loading={formSubmitting}
        />
      </Modal>

      {/* 添加任务的模态框 */}
      <Modal
        title="添加任务"
        open={taskModalVisible}
        onCancel={() => setTaskModalVisible(false)}
        footer={null}
        destroyOnClose={true}
        maskClosable={false}
      >
        <TaskForm
          goals={goals}
          onFinish={handleTaskFormSubmit}
          onCancel={() => setTaskModalVisible(false)}
          loading={formSubmitting}
        />
      </Modal>
    </div>
  )
}

export default ObjectivesPage
