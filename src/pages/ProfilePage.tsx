import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FireOutlined,
  MailOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Statistic,
  Tabs,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd'
import { RcFile } from 'antd/es/upload'
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './ProfilePage.css'

const { Title, Text, Paragraph } = Typography

interface Achievement {
  id: string
  title: string
  date: string
  points: number
}

interface UserStats {
  completedGoals: number
  completedTasks: number
  studyHours: number
  continuousLoginDays: number
  level: number
  experience: number
  nextLevelExperience: number
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth()
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar)

  // 模拟用户统计数据
  const userStats: UserStats = {
    completedGoals: 24,
    completedTasks: 186,
    studyHours: 342,
    continuousLoginDays: 15,
    level: 6,
    experience: 2450,
    nextLevelExperience: 3000,
  }

  // 模拟成就数据
  const achievements: Achievement[] = [
    { id: '1', title: '学习先锋', date: '2023-12-15', points: 100 },
    { id: '2', title: '持之以恒', date: '2023-11-30', points: 150 },
    { id: '3', title: '知识探索者', date: '2024-01-10', points: 200 },
    { id: '4', title: '目标达成者', date: '2024-02-05', points: 100 },
    { id: '5', title: '连续学习7天', date: '2024-03-20', points: 50 },
  ]

  // 头像上传前的处理
  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
    if (!isJpgOrPng) {
      message.error('只能上传 JPG/PNG 格式的图片!')
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('图片必须小于 2MB!')
    }
    return isJpgOrPng && isLt2M
  }

  // 处理头像变更
  const handleAvatarChange = (info: any) => {
    if (info.file.status === 'done') {
      // 这里应该从后端返回的响应中获取头像URL
      // 模拟从服务器获取头像URL
      setAvatarUrl(URL.createObjectURL(info.file.originFileObj))
      message.success('头像上传成功!')
    }
  }

  // 处理个人资料编辑
  const handleProfileEdit = () => {
    form.setFieldsValue({
      nickname: user?.username || '',
      email: 'user@example.com', // 替换为实际邮箱
      bio: '这是我的个人简介',
      education: '本科',
      major: '计算机科学',
      interests: '编程, 读书, 音乐',
    })
    setEditModalVisible(true)
  }

  // 保存个人资料
  const handleProfileSave = async () => {
    try {
      const values = await form.validateFields()
      console.log('更新的个人资料:', values)
      // 这里应该调用API将更新后的个人资料发送到后端
      message.success('个人资料更新成功!')
      setEditModalVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const profileTabItems = [
    {
      key: 'about',
      label: '关于我',
      children: (
        <div className="profile-about">
          <Paragraph>
            这是我的个人简介，介绍我自己的学习目标、兴趣爱好和专业背景。
          </Paragraph>
          <Divider orientation="left">基本信息</Divider>
          <Row>
            <Col span={12}>
              <p>
                <UserOutlined /> 昵称: {user?.username || '用户'}
              </p>
              <p>
                <MailOutlined /> 邮箱: user@example.com
              </p>
              <p>
                <CalendarOutlined /> 注册时间: 2023年10月15日
              </p>
            </Col>
            <Col span={12}>
              <p>
                <TeamOutlined /> 学历: 本科
              </p>
              <p>
                <StarOutlined /> 专业: 计算机科学
              </p>
              <p>兴趣爱好: 编程, 读书, 音乐</p>
            </Col>
          </Row>
          <Divider orientation="left">学习标签</Divider>
          <div>
            <Tag color="blue">编程</Tag>
            <Tag color="green">数学</Tag>
            <Tag color="orange">英语</Tag>
            <Tag color="purple">人工智能</Tag>
            <Tag color="cyan">Web开发</Tag>
            <Tag color="red">数据结构</Tag>
          </div>
        </div>
      ),
    },
    {
      key: 'achievements',
      label: '我的成就',
      children: (
        <div className="profile-achievements">
          <Row gutter={[16, 16]}>
            {achievements.map((achievement) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                key={achievement.id}
              >
                <Card
                  hoverable
                  className="achievement-card"
                >
                  <div className="achievement-icon">
                    <TrophyOutlined
                      style={{ fontSize: '32px', color: '#faad14' }}
                    />
                  </div>
                  <div className="achievement-content">
                    <Title level={5}>{achievement.title}</Title>
                    <Text type="secondary">获得时间: {achievement.date}</Text>
                    <div className="achievement-points">
                      <StarOutlined /> {achievement.points} 分
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ),
    },
    {
      key: 'stats',
      label: '学习统计',
      children: (
        <div className="profile-stats">
          <Row gutter={[16, 16]}>
            <Col
              xs={24}
              sm={12}
              md={6}
            >
              <Card>
                <Statistic
                  title="已完成目标"
                  value={userStats.completedGoals}
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={6}
            >
              <Card>
                <Statistic
                  title="已完成任务"
                  value={userStats.completedTasks}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={6}
            >
              <Card>
                <Statistic
                  title="累计学习时长 (小时)"
                  value={userStats.studyHours}
                  prefix={<ClockCircleOutlined />}
                />
              </Card>
            </Col>
            <Col
              xs={24}
              sm={12}
              md={6}
            >
              <Card>
                <Statistic
                  title="连续登录天数"
                  value={userStats.continuousLoginDays}
                  prefix={<FireOutlined />}
                />
              </Card>
            </Col>
          </Row>

          <Card
            title="等级进度"
            style={{ marginTop: '20px' }}
          >
            <div className="level-info">
              <Title level={4}>等级 {userStats.level}</Title>
              <Progress
                percent={Math.round(
                  (userStats.experience / userStats.nextLevelExperience) * 100,
                )}
                format={() =>
                  `${userStats.experience}/${userStats.nextLevelExperience}`
                }
                status="active"
              />
              <Text type="secondary">
                还需要 {userStats.nextLevelExperience - userStats.experience}{' '}
                经验值升级到 {userStats.level + 1} 级
              </Text>
            </div>
          </Card>
        </div>
      ),
    },
  ]

  return (
    <div className="profile-page">
      <Card bordered={false}>
        <div className="profile-header">
          <div className="profile-avatar-container">
            <Avatar
              size={120}
              icon={<UserOutlined />}
              src={avatarUrl}
            />
            <div className="avatar-overlay">
              <Upload
                name="avatar"
                showUploadList={false}
                beforeUpload={beforeUpload}
                onChange={handleAvatarChange}
                action="http://localhost:8080/api/user/avatar"
                headers={{
                  Authorization: `Bearer ${localStorage.getItem('authToken')}`,
                }}
              >
                <Button
                  icon={<UploadOutlined />}
                  size="small"
                >
                  更换头像
                </Button>
              </Upload>
            </div>
          </div>
          <div className="profile-info">
            <Title level={3}>{user?.username || '用户'}</Title>
            <div className="profile-meta">
              <div className="user-level">
                <Tag color="gold">Lv.{userStats.level}</Tag>
              </div>
              <div className="user-stats">
                <span>
                  <TrophyOutlined /> 成就: {achievements.length}
                </span>
                <Divider type="vertical" />
                <span>
                  <CalendarOutlined /> 注册于: 2023/10/15
                </span>
              </div>
            </div>
            <div className="profile-actions">
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleProfileEdit}
              >
                编辑个人资料
              </Button>
            </div>
          </div>
        </div>

        <Tabs
          items={profileTabItems}
          defaultActiveKey="about"
          style={{ marginTop: '20px' }}
        />
      </Card>

      {/* 编辑个人资料的模态框 */}
      <Modal
        title="编辑个人资料"
        open={editModalVisible}
        onOk={handleProfileSave}
        onCancel={() => setEditModalVisible(false)}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称!' }]}
          >
            <Input placeholder="输入您的昵称" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱!' },
              { type: 'email', message: '请输入有效的邮箱地址!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="your.email@example.com"
            />
          </Form.Item>
          <Form.Item
            name="bio"
            label="个人简介"
          >
            <Input.TextArea
              rows={4}
              placeholder="简单介绍一下自己吧"
            />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="education"
                label="学历"
              >
                <Input placeholder="例如: 本科、研究生" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="major"
                label="专业"
              >
                <Input placeholder="例如: 计算机科学、数学" />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="interests"
            label="兴趣爱好"
          >
            <Input placeholder="用逗号分隔您的兴趣爱好" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default ProfilePage
