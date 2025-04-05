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
  Checkbox,
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
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { login as apiLogin, LoginRequest } from '../services/authService'
import '../styles/LoginPage.css'

const { Title } = Typography
const { darkAlgorithm, defaultAlgorithm } = theme

const LoginPage: React.FC = () => {
  const { theme: appTheme, toggleTheme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()

  const onFinish = async (values: any) => {
    setLoading(true)
    setError(null)

    try {
      // 使用authService中的login函数
      const loginData: LoginRequest = {
        username: values.username,
        password: values.password,
      }

      const result = await apiLogin(loginData)

      // 登录成功，使用AuthContext的login方法
      // 现在将完整的用户信息传递给login函数
      login(result.token, result.userInfo)

      message.success('登录成功！即将跳转...', 1)

      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } catch (err) {
      console.error('Login failed:', err)
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 修改：只有当用户已登录并且有有效token时才跳转
  React.useEffect(() => {
    // 检查是否真的已登录
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // 动态登录页面类名，用于深色模式切换
  const loginPageClassName = `login-page ${
    appTheme === 'dark' ? 'dark-theme' : ''
  }`

  return (
    <ConfigProvider
      theme={{
        algorithm: appTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
      }}
    >
      <div className={loginPageClassName}>
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
            欢迎回来
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
            name="normal_login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入您的用户名!' }]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="用户名"
                size="large"
              />
            </Form.Item>
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入您的密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="密码"
                size="large"
              />
            </Form.Item>
            <Form.Item>
              <div className="login-form-container">
                <Form.Item
                  name="remember"
                  valuePropName="checked"
                  noStyle
                >
                  <Checkbox>记住我</Checkbox>
                </Form.Item>
                <a
                  className="login-form-forgot"
                  href="/forgot-password"
                >
                  忘记密码?
                </a>
              </div>
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
                登录
              </Button>
              <div className="login-form-bottom">
                或者 <a href="/signup">现在注册!</a>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </ConfigProvider>
  )
}

export default LoginPage
