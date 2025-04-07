import {
  BellOutlined,
  CheckCircleFilled,
  ExclamationCircleOutlined,
  LockOutlined,
  PushpinOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Switch,
  Tabs,
  Typography,
} from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import {
  updatePassword,
  UpdatePasswordRequest,
} from '../services/profileService'

const { Title, Text } = Typography
const { Option } = Select
const { confirm } = Modal

const SettingsPage: React.FC = () => {
  // 状态管理
  const [passwordForm] = Form.useForm()
  const [notificationForm] = Form.useForm()
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [notificationSuccess, setNotificationSuccess] = useState(false)

  // 主题设置
  const { theme, toggleTheme } = useTheme()

  // 添加访问 AuthContext 和路由导航功能
  const { logout } = useAuth()
  const navigate = useNavigate()

  // 处理密码修改
  const onFinishPassword = async (values: UpdatePasswordRequest) => {
    try {
      setPasswordLoading(true)
      setPasswordError(null)

      // 调用API更新密码
      await updatePassword(values)

      // API调用成功后
      setPasswordSuccess(true)
      message.success('密码修改成功！系统将在3秒后自动退出登录...')

      // 3秒后自动退出登录并跳转到登录页面
      setTimeout(() => {
        logout() // 调用退出登录函数
        navigate('/login') // 跳转到登录页面
      }, 3000)
    } catch (error: any) {
      console.error('密码修改错误:', error)
      setPasswordError(
        error.response?.data?.message || '密码修改失败，请稍后再试',
      )
      message.error('密码修改失败，请检查当前密码是否正确')
      setPasswordLoading(false)
    }
  }

  // 处理通知设置
  const onFinishNotifications = async (values: any) => {
    try {
      setNotificationLoading(true)
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log('Notification settings submitted:', values)

      // API调用成功后
      setNotificationSuccess(true)
      message.success('通知设置已更新')

      // 3秒后隐藏成功提示
      setTimeout(() => {
        setNotificationSuccess(false)
      }, 3000)
    } catch (error) {
      message.error('通知设置更新失败，请稍后再试')
      console.error('通知设置错误:', error)
    } finally {
      setNotificationLoading(false)
    }
  }

  // 显示密码修改确认对话框
  const showPasswordConfirm = () => {
    passwordForm
      .validateFields()
      .then((values) => {
        confirm({
          title: '确认修改密码',
          icon: <ExclamationCircleOutlined />,
          content: '修改密码后需要重新登录，确定要继续吗？',
          onOk() {
            onFinishPassword(values)
          },
        })
      })
      .catch((info) => {
        console.log('Validate Failed:', info)
      })
  }

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <LockOutlined /> 账号安全
        </span>
      ),
      children: (
        <Card
          title={<Title level={4}>修改密码</Title>}
          bordered={false}
          className="settings-card"
        >
          {passwordSuccess && (
            <Alert
              message="密码修改成功"
              type="success"
              showIcon
              icon={<CheckCircleFilled />}
              style={{ marginBottom: 24 }}
            />
          )}

          {passwordError && (
            <Alert
              message="密码修改失败"
              description={passwordError}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 24 }}
              onClose={() => setPasswordError(null)}
            />
          )}

          <Form
            form={passwordForm}
            layout="vertical"
            requiredMark="optional"
          >
            <Form.Item
              label="当前密码"
              name="currentPassword"
              rules={[{ required: true, message: '请输入当前密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入当前密码"
              />
            </Form.Item>
            <Form.Item
              label="新密码"
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 8, message: '密码长度不能小于8个字符' },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: '密码需包含大小写字母和数字',
                },
              ]}
              extra="密码长度至少为8个字符，且必须包含大小写字母和数字"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入新密码"
              />
            </Form.Item>
            <Form.Item
              label="确认新密码"
              name="confirmPassword"
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入新密码"
              />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={showPasswordConfirm}
                loading={passwordLoading}
              >
                修改密码
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <BellOutlined /> 通知设置
        </span>
      ),
      children: (
        <Card
          title={<Title level={4}>通知偏好</Title>}
          bordered={false}
          className="settings-card"
        >
          {notificationSuccess && (
            <Alert
              message="通知设置已保存"
              type="success"
              showIcon
              icon={<CheckCircleFilled />}
              style={{ marginBottom: 24 }}
            />
          )}
          <Form
            form={notificationForm}
            layout="vertical"
            onFinish={onFinishNotifications}
            initialValues={{ emailNotifications: true, taskReminders: 'daily' }}
          >
            <Form.Item
              name="emailNotifications"
              label="邮件通知"
              valuePropName="checked"
              extra="接收重要的系统通知和更新"
            >
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </Form.Item>

            <Form.Item
              name="taskReminders"
              label="任务提醒频率"
              extra="选择接收学习任务提醒的频率"
            >
              <Select style={{ width: '50%' }}>
                <Option value="daily">每天</Option>
                <Option value="weekly">每周</Option>
                <Option value="never">从不</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="communityUpdates"
              label="社区动态通知"
              valuePropName="checked"
              extra="接收来自社区的更新、互动和回复"
            >
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </Form.Item>

            <Form.Item
              name="achievementNotifications"
              label="成就解锁通知"
              valuePropName="checked"
              extra="当你解锁新成就时收到通知"
              initialValue={true}
            >
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
              />
            </Form.Item>

            <Divider />

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={notificationLoading}
              >
                保存通知设置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: '3',
      label: (
        <span>
          <SettingOutlined /> 偏好设置
        </span>
      ),
      children: (
        <Card
          title={<Title level={4}>应用偏好</Title>}
          bordered={false}
          className="settings-card"
        >
          <Space
            direction="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Text strong>主题设置</Text>
                <div>
                  <Text type="secondary">选择深色或浅色模式</Text>
                </div>
              </div>
              <Switch
                checkedChildren="深色"
                unCheckedChildren="浅色"
                checked={theme === 'dark'}
                onChange={toggleTheme}
              />
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Text strong>默认页面</Text>
                <div>
                  <Text type="secondary">登录后首先显示的页面</Text>
                </div>
              </div>
              <Select
                defaultValue="dashboard"
                style={{ width: '200px' }}
              >
                <Option value="dashboard">仪表盘</Option>
                <Option value="objectives">目标与任务</Option>
                <Option value="courses">课程/科目</Option>
              </Select>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <Text strong>固定侧边栏</Text>
                <div>
                  <Text type="secondary">侧边导航栏始终可见</Text>
                </div>
              </div>
              <Switch
                checkedChildren={<PushpinOutlined />}
                unCheckedChildren={<PushpinOutlined />}
                defaultChecked
              />
            </div>
          </Space>

          <Divider />

          <Button
            type="primary"
            icon={<SaveOutlined />}
          >
            保存偏好设置
          </Button>
        </Card>
      ),
    },
  ]

  return (
    <div
      className="settings-container"
      style={{ padding: '0 24px', maxWidth: '900px' }}
    >
      <Title level={2}>设置</Title>
      <Text
        type="secondary"
        style={{ marginBottom: 24, display: 'block' }}
      >
        管理您的账户、通知和应用偏好。
      </Text>

      <Tabs
        items={tabItems}
        defaultActiveKey="1"
        type="card"
        style={{ marginTop: 24 }}
        size="large"
      />
    </div>
  )
}

export default SettingsPage
