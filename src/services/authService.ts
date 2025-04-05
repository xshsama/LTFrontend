import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

// 定义登录请求和响应的接口
export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    // 根据实际API响应添加其他字段
}

// 登录函数
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, credentials);

        // 假设API返回格式为 { code: number, message: string, data: { token: string, ...其他数据 } }
        if (response.data.code === 200 && response.data.data?.token) {
            return response.data.data;
        } else {
            throw new Error(response.data.message || '登录失败，请检查用户名和密码');
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // 处理服务器返回的错误
            throw new Error(error.response.data?.message || '登录请求失败，请稍后重试');
        }
        // 处理网络错误或其他错误
        throw new Error('登录请求失败，请检查网络连接');
    }
};

// 注册函数
export const register = async (data: { username: string; password: string }): Promise<any> => {
    try {
        const response = await axios.post(`${API_URL}/auth/register`, data);
        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || '注册失败');
        }
        throw new Error('注册请求失败，请检查网络连接');
    }
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<any> => {
    const token = localStorage.getItem('authToken');

    if (!token) {
        throw new Error('未登录');
    }

    try {
        const response = await axios.get(`${API_URL}/user/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data.data;
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data?.message || '获取用户信息失败');
        }
        throw new Error('获取用户信息请求失败，请检查网络连接');
    }
};