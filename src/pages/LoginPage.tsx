import {
  LockOutlined,
  MoonOutlined, // Import Moon icon
  SunOutlined, // Import Sun icon
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Switch, // Import Switch
  Typography,
  theme,
} from 'antd' // Import theme
import React from 'react'
import { useTheme } from '../contexts/ThemeContext' // Import useTheme
import '../styles/LoginPage.css'

const { Title } = Typography

const LoginPage: React.FC = () => {
  const { theme: appTheme, toggleTheme } = useTheme() // Get app's theme state and toggle function
  const { token } = theme.useToken() // Get Ant Design theme tokens

  const onFinish = (values: any) => {
    console.log('Received values of form: ', values)
    // 在这里处理登录逻辑
    // 登录成功后，可以重定向到主页或其他页面
  }

  return (
    // Apply the layout background color from Ant Design tokens based on the theme
    <div
      className="login-page"
      style={{ backgroundColor: token.colorBgLayout }}
    >
      <Card
        className="login-card"
        // Card background (colorBgContainer) should be handled automatically by ConfigProvider in App.tsx
        bordered={false}
      >
        {/* Add Theme Switch */}
        <Switch
          checked={appTheme === 'dark'}
          onChange={toggleTheme}
          checkedChildren={<MoonOutlined />}
          unCheckedChildren={<SunOutlined />}
          style={{ position: 'absolute', top: 20, right: 20 }} // Position the switch
        />
        <Title
          level={2}
          style={{
            textAlign: 'center',
            marginBottom: '24px',
            marginTop: '40px',
          }} // Add margin top to avoid overlap
        >
          欢迎回来
        </Title>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical" // Use vertical layout for labels above inputs
        >
          <Form.Item
            name="username"
            label="用户名" // Use label prop instead of separate label element
            rules={[{ required: true, message: '请输入您的用户名!' }]}
          >
            <Input
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="用户名"
              size="large" // Make input larger
            />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码" // Use label prop
            rules={[{ required: true, message: '请输入您的密码!' }]}
          >
            <Input.Password // Use Input.Password for visibility toggle
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="密码"
              size="large" // Make input larger
            />
          </Form.Item>
          <Form.Item>
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
              style={{ float: 'right' }} // Align forgot password link to the right
            >
              忘记密码?
            </a>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              block // Make button full width
              size="large" // Make button larger
            >
              登录
            </Button>
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              或者 <a href="/signup">现在注册!</a>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default LoginPage
