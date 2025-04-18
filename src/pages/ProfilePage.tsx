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
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Statistic,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import React, { useEffect, useState } from 'react'
import AvatarUploader from '../components/AvatarUploader'
import { useAuth } from '../contexts/AuthContext'
import {
  getUserProfile,
  UpdateProfileRequest,
  updateUserProfile,
  UserProfile,
} from '../services/profileService'
import './ProfilePage.css'

const { Title, Text, Paragraph } = Typography

interface Achievement {
  id: string
  title: string
  date: string
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
  const { user, updateUserInfo } = useAuth() // 添加 updateUserInfo
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | null>(null)

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
    { id: '1', title: '学习先锋', date: '2023-12-15' },
    { id: '2', title: '持之以恒', date: '2023-11-30' },
    { id: '3', title: '知识探索者', date: '2024-01-10' },
    { id: '4', title: '目标达成者', date: '2024-02-05' },
    { id: '5', title: '连续学习7天', date: '2024-03-20' },
  ]

  // 在组件加载时获取用户个人资料
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        console.log('开始请求用户个人资料...')
        const profileData = await getUserProfile()
        console.log('获取的用户个人资料数据:', profileData)

        // 如果服务器返回了个人资料数据，则更新状态
        if (profileData) {
          setProfile(profileData)
          setAvatarUrl(profileData.avatar)
          console.log('用户个人资料已更新到状态')
        } else {
          // 用户未登录或者没有设置个人资料
          console.log('警告: 服务器返回了空的个人资料数据')
          setProfile(null)
          setError('无法加载个人资料数据，请稍后再试')
        }
        setLoading(false)
      } catch (error: any) {
        console.error('获取个人资料失败:', error)
        setProfile(null)
        setError(error?.message || '获取个人资料失败，请稍后再试')
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  // 在个人资料更新或模态框打开时，自动更新表单数据
  useEffect(() => {
    if (profile && editModalVisible) {
      form.setFieldsValue({
        nickname: profile.nickname || user?.username || '',
        bio: profile.bio || '',
        birthday: profile.birthday ? dayjs(profile.birthday) : undefined,
        location: profile.location || '',
        education: profile.education || '',
        profession: profile.profession || '',
      })
    }
  }, [profile, editModalVisible, form, user])

  // 处理头像上传成功
  const handleAvatarSuccess = async (newAvatarUrl: string) => {
    try {
      setLoading(true)

      // 更新本地状态
      setAvatarUrl(newAvatarUrl)

      // 更新个人资料中的头像URL
      if (profile) {
        const updatedProfile = {
          ...profile,
          avatar: newAvatarUrl,
        }
        setProfile(updatedProfile)

        // 重要：将新头像URL保存到服务器
        await updateUserProfile({ avatar: newAvatarUrl })
      }

      // 更新全局用户状态
      updateUserInfo({ avatar: newAvatarUrl })

      message.success('头像更新成功！')
      setLoading(false)
    } catch (error) {
      console.error('保存头像到个人资料失败:', error)
      message.error('头像更新失败，请重试！')
      setLoading(false)
    }
  }

  // 处理个人资料编辑
  const handleProfileEdit = () => {
    setEditModalVisible(true)
  }

  // 保存个人资料
  const handleProfileSave = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)

      // 准备更新请求数据
      const updateData: UpdateProfileRequest = {
        nickname: values.nickname,
        bio: values.bio,
        birthday: values.birthday
          ? values.birthday.format('YYYY-MM-DD')
          : undefined,
        location: values.location,
        education: values.education,
        profession: values.profession,
      }

      // 调用更新个人资料API
      const updatedProfile = await updateUserProfile(updateData)

      // 更新本地状态
      setProfile(updatedProfile)
      message.success('个人资料更新成功!')
      setEditModalVisible(false)
      setLoading(false)
    } catch (error) {
      console.error('更新个人资料失败:', error)
      message.error('个人资料更新失败，请稍后再试!')
      setLoading(false)
    }
  }

  const profileTabItems = [
    {
      key: 'about',
      label: '关于我',
      children: (
        <div className="profile-about">
          <Paragraph>
            {profile?.bio ||
              '这是我的个人简介，介绍我自己的学习目标、兴趣爱好和专业背景。'}
          </Paragraph>
          <Divider orientation="left">基本信息</Divider>
          <Row>
            <Col span={12}>
              <p>
                <UserOutlined /> 昵称:{' '}
                {profile?.nickname || user?.username || '用户'}
              </p>
              <p>
                <CalendarOutlined />{' '}
                {profile?.birthday ? `生日: ${profile.birthday}` : '未设置生日'}
              </p>
              <p>
                <CalendarOutlined /> 注册时间: {profile?.createdAt || '未知'}
              </p>
            </Col>
            <Col span={12}>
              <p>
                <TeamOutlined /> 学历: {profile?.education || '未设置'}
              </p>
              <p>
                <StarOutlined /> 职业: {profile?.profession || '未设置'}
              </p>
              <p>
                <MailOutlined /> 位置: {profile?.location || '未设置'}
              </p>
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
    // ...其他标签项保持不变
    {
      key: 'achievements',
      label: '我的成就',
      children: (
        // ...成就内容保持不变
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
        // ...统计内容保持不变
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
      <Card
        bordered={false}
        loading={loading}
      >
        {error && (
          <Alert
            message="加载错误"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            closable
            onClose={() => setError(null)}
          />
        )}

        {!loading && !profile && !error && (
          <Alert
            message="未找到个人资料"
            description="暂无个人资料数据，请先设置您的个人信息"
            type="info"
            showIcon
          />
        )}

        {profile && (
          <>
            <div className="profile-header">
              <div className="profile-avatar-container">
                {/* 使用新的AvatarUploader组件替换原来的上传组件 */}
                <AvatarUploader
                  currentAvatar={avatarUrl}
                  onSuccess={handleAvatarSuccess}
                  size={120}
                />
              </div>
              <div className="profile-info">
                <Title level={3}>
                  {profile?.nickname || user?.username || '用户'}
                </Title>
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
                      <CalendarOutlined /> 注册于:{' '}
                      {profile?.createdAt || '未知'}
                    </span>
                  </div>
                </div>
                <div className="profile-actions">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={handleProfileEdit}
                    loading={loading}
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
          </>
        )}
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
        confirmLoading={loading}
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
            name="bio"
            label="个人简介"
          >
            <Input.TextArea
              rows={4}
              placeholder="简单介绍一下自己吧"
            />
          </Form.Item>
          <Form.Item
            name="birthday"
            label="生日"
          >
            <DatePicker
              style={{ width: '100%' }}
              placeholder="选择您的生日"
            />
          </Form.Item>
          <Form.Item
            name="location"
            label="所在地"
          >
            <Input placeholder="例如: 北京市、上海市" />
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
                name="profession"
                label="职业"
              >
                <Input placeholder="例如: 软件工程师、教师" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}

export default ProfilePage
