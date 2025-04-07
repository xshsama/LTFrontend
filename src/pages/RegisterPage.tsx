import {
  LockOutlined,
  MoonOutlined,
  SunOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  ConfigProvider,
  Form,
  Input,
  message,
  Switch,
  theme,
  Typography,
} from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { register, RegisterRequest } from '../services/authService'
import '../styles/LoginPage.css' // 复用登录页面的样式

const { Title } = Typography
const { darkAlgorithm, defaultAlgorithm } = theme

const RegisterPage: React.FC = () => {
  const { theme: appTheme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const onFinish = async (values: any) => {
    // 确保两次输入的密码一致
    if (values.password !== values.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // 调用注册API，包含确认密码字段
      const registerData: RegisterRequest = {
        username: values.username,
        password: values.password,
        confirmPassword: values.confirmPassword, // 确保包含确认密码字段
      }

      await register(registerData)

      message.success('注册成功！即将跳转到登录页面...', 2)

      // 注册成功后跳转到登录页面
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      console.error('Registration failed:', err)
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 动态页面类名，用于深色模式切换
  const pageClassName = `login-page ${appTheme === 'dark' ? 'dark-theme' : ''}`

  return (
    <ConfigProvider
      theme={{
        algorithm: appTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <div className={pageClassName}>
        <Card
          className="login-card"
          bordered={false}
        >
          <Switch
            checked={appTheme === 'dark'}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
            style={{ position: 'absolute', top: 20, right: 20 }}
          />
          <Title
            level={2}
            className="page-title"
          >
            创建账户
          </Title>
          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}
          <Form
            name="register_form"
            className="login-form"
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名!' },
                { min: 3, message: '用户名至少3个字符!' },
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 6, message: '密码至少6个字符!' },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'))
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请确认密码"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className="login-form-button"
                block
                size="large"
                loading={loading}
              >
                注册
              </Button>
              <div className="login-form-bottom">
                已有账号? <a href="/login">立即登录!</a>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  )
}

export default RegisterPage
