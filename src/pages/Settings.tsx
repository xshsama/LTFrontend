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
  Switch,
  Tabs,
  Typography,
} from 'antd'
import React, { useEffect, useState } from 'react' // 引入 useEffect
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
// 引入偏好设置服务和类型
import {
  getUserPreferences,
  updateUserPreferences,
  UserPreference,
} from '../services/preferenceService'
import {
  updatePassword,
  UpdatePasswordRequest,
} from '../services/profileService'

const { Title, Text } = Typography
const { Option } = Select
const { confirm } = Modal

const SettingsPage: React.FC = () => {
  // 状态管理
  const [passwordForm] = Form.useForm<UpdatePasswordRequest>()
  const [notificationForm] = Form.useForm<UserPreference>() // 指定表单数据类型
  const [preferenceForm] = Form.useForm<UserPreference>() // 新增偏好设置表单
  const [loading, setLoading] = useState(true) // 统一加载状态
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [notificationLoading, setNotificationLoading] = useState(false)
  const [preferenceLoading, setPreferenceLoading] = useState(false) // 新增偏好设置加载状态
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [notificationSuccess, setNotificationSuccess] = useState(false)
  const [preferenceSuccess, setPreferenceSuccess] = useState(false) // 新增偏好设置成功状态

  // 主题设置 (保留 useTheme)
  const { theme, toggleTheme: contextToggleTheme } = useTheme()

  // 访问 AuthContext 和路由导航功能
  const { logout } = useAuth()
  const navigate = useNavigate()

  // --- 数据获取 ---
  useEffect(() => {
    const fetchPreferences = async () => {
      setLoading(true)
      try {
        const prefs = await getUserPreferences()
        // 使用获取的数据设置表单初始值
        notificationForm.setFieldsValue(prefs)
        preferenceForm.setFieldsValue(prefs)
        // 如果主题设置来自 context，确保 UI 同步 (如果 prefs.theme 存在)
        if (prefs.theme && prefs.theme !== theme) {
          // 注意：这里可能需要更复杂的逻辑来同步 context 和后端设置
          console.warn(
            `Theme mismatch: context is ${theme}, backend is ${prefs.theme}`,
          )
          // 可以在这里决定是以 context 为准还是以后端为准
        }
      } catch (error) {
        message.error('加载用户偏好设置失败')
        console.error('加载偏好设置错误:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchPreferences()
  }, [notificationForm, preferenceForm, theme]) // 依赖加入表单实例和 theme

  // --- 处理密码修改 ---
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

  // --- 处理通知设置 ---
  const onFinishNotifications = async (values: UserPreference) => {
    setNotificationLoading(true)
    setNotificationSuccess(false) // 重置成功状态
    try {
      console.log('提交通知设置:', values)
      await updateUserPreferences(values)
      setNotificationSuccess(true)
      message.success('通知设置已更新')
      // 短暂显示成功信息
      setTimeout(() => setNotificationSuccess(false), 3000)
    } catch (error: any) {
      message.error(error.message || '通知设置更新失败，请稍后再试')
      console.error('通知设置错误:', error)
    } finally {
      setNotificationLoading(false)
    }
  }

  // --- 处理偏好设置 --- (新增)
  const onFinishPreferences = async (values: UserPreference) => {
    setPreferenceLoading(true)
    setPreferenceSuccess(false) // 重置成功状态
    try {
      console.log('提交偏好设置:', values)
      // 注意：主题切换可能需要特殊处理，因为它也由 ThemeContext 控制
      // 这里我们先直接更新后端
      await updateUserPreferences(values)
      setPreferenceSuccess(true)
      message.success('偏好设置已更新')
      // 如果主题被更改，也调用 context 的切换函数 (可选，取决于设计)
      if (values.theme && values.theme !== theme) {
        // contextToggleTheme(); // 调用 context 的切换函数，如果需要立即反映
        // 或者提示用户刷新页面以应用主题
        message.info('主题设置已更新，可能需要刷新页面查看效果。')
      }
      // 短暂显示成功信息
      setTimeout(() => setPreferenceSuccess(false), 3000)
    } catch (error: any) {
      message.error(error.message || '偏好设置更新失败，请稍后再试')
      console.error('偏好设置错误:', error)
    } finally {
      setPreferenceLoading(false)
    }
  }

  // --- 主题切换处理 --- (修改)
  // 包装原始的 toggleTheme，以便在切换时也更新表单值
  const handleThemeToggle = (checked: boolean) => {
    const newTheme = checked ? 'dark' : 'light'
    contextToggleTheme() // 调用原始 context 方法切换主题
    preferenceForm.setFieldsValue({ theme: newTheme }) // 更新表单中的值
    // 注意：这里不立即调用保存，让用户点击保存按钮
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
          <Form<UserPreference> // 指定泛型类型
            form={notificationForm}
            layout="vertical"
            onFinish={onFinishNotifications}
            // initialValues 不再需要，由 useEffect 设置
          >
            <Form.Item
              name="emailNotifications" // 匹配 DTO/Entity
              label="邮件通知"
              valuePropName="checked" // Switch 使用 checked
              extra="接收重要的系统通知和更新"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="taskReminderFrequency" // 匹配 DTO/Entity
              label="任务提醒频率"
              extra="选择接收学习任务提醒的频率"
            >
              <Select
                style={{ width: '50%' }}
                placeholder="选择频率"
              >
                <Option value="daily">每天</Option>
                <Option value="weekly">每周</Option>
                <Option value="never">从不</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="communityUpdatesEnabled" // 匹配 DTO/Entity
              label="社区动态通知"
              valuePropName="checked"
              extra="接收来自社区的更新、互动和回复"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              name="achievementNotificationsEnabled" // 匹配 DTO/Entity
              label="成就解锁通知"
              valuePropName="checked"
              extra="当你解锁新成就时收到通知"
            >
              <Switch />
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
          {/* 新增成功提示 */}
          {preferenceSuccess && (
            <Alert
              message="偏好设置已保存"
              type="success"
              showIcon
              icon={<CheckCircleFilled />}
              style={{ marginBottom: 24 }}
            />
          )}
          {/* 将偏好设置内容放入 Form 中 */}
          <Form<UserPreference> // 指定泛型类型
            form={preferenceForm}
            layout="vertical"
            onFinish={onFinishPreferences}
            // initialValues 不再需要，由 useEffect 设置
          >
            <Form.Item
              name="theme" // 匹配 DTO/Entity
              label="主题设置"
              valuePropName="checked" // Switch 使用 checked
              getValueFromEvent={(checked) => (checked ? 'dark' : 'light')} // 转换 Switch 值
              // 注意：这里的 label 和 extra 只是展示，实际控制在下面的 Switch
            >
              {/* 使用 Form.Item 包裹，但实际控制 UI 在下面 */}
              {/* 这个 Form.Item 主要用于收集/设置 'theme' 的值 */}
            </Form.Item>
            {/* 单独渲染 Switch 并连接到 handleThemeToggle */}
            <div style={{ marginBottom: 24 }}>
              {' '}
              {/* 添加一些间距 */}
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
                  checked={theme === 'dark'} // 从 context 获取当前主题状态
                  onChange={handleThemeToggle} // 使用包装后的切换函数
                />
              </div>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Form.Item
              name="defaultPage" // 匹配 DTO/Entity
              label="默认页面"
              extra="登录后首先显示的页面"
            >
              <Select
                style={{ width: '200px' }}
                placeholder="选择默认页面"
              >
                <Option value="dashboard">仪表盘</Option>
                <Option value="objectives">目标与任务</Option>
                <Option value="courses">课程/科目</Option>
              </Select>
            </Form.Item>

            <Divider style={{ margin: '12px 0' }} />

            <Form.Item
              name="fixedSidebarEnabled" // 匹配 DTO/Entity
              label="固定侧边栏"
              valuePropName="checked" // Switch 使用 checked
              extra="侧边导航栏始终可见"
            >
              {/* 这个 Form.Item 主要用于收集/设置 'fixedSidebarEnabled' 的值 */}
            </Form.Item>
            {/* 单独渲染 Switch */}
            <div style={{ marginBottom: 24 }}>
              {' '}
              {/* 添加一些间距 */}
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
                {/* 从 Form 中获取 Switch 的状态 */}
                <Form.Item
                  name="fixedSidebarEnabled"
                  valuePropName="checked"
                  noStyle
                >
                  <Switch
                    checkedChildren={<PushpinOutlined />}
                    unCheckedChildren={<PushpinOutlined />}
                  />
                </Form.Item>
              </div>
            </div>

            <Divider />

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit" // 改为 submit 以触发表单 onFinish
                icon={<SaveOutlined />}
                loading={preferenceLoading} // 使用偏好设置加载状态
              >
                保存偏好设置
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ]

  // 添加全局加载状态显示
  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>
  }

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
