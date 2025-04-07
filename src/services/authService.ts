import { removeCookie, setObjectInCookie } from '../utils/cookies';
import apiClient from './apiService';

// 定义登录请求和响应的接口
export interface LoginRequest {
    username: string;
    password: string;
}

// 用户信息接口
export interface UserInfo {
    username: string;
    nickname?: string;
    avatar?: string;
    bio?: string;
    birthday?: string;
    location?: string;
    education?: string;
    profession?: string;
}

// 更新后的登录响应接口，包含用户信息
export interface LoginResponse {
    token: string;
    userInfo: UserInfo;
}

// 刷新令牌响应接口
export interface RefreshTokenResponse {
    token: string;
}

// 登录函数
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
        const response = await apiClient.post(`/auth/login`, credentials);

        // 假设API返回格式为 { code: number, message: string, data: { token: string, userInfo: {...} } }
        if (response.data.code === 200 && response.data.data?.token) {
            const loginResponse = response.data.data;

            // 将用户信息存储到cookie中，有效期7天
            setObjectInCookie('userInfo', loginResponse.userInfo, 7);

            // 返回完整的登录响应
            return loginResponse;
        } else {
            throw new Error(response.data.message || '登录失败，请检查用户名和密码');
        }
    } catch (error: any) {
        if (error.response) {
            // 处理服务器返回的错误
            throw new Error(error.response.data?.message || '登录请求失败，请稍后重试');
        }
        // 处理网络错误或其他错误
        throw new Error('登录请求失败，请检查网络连接');
    }
};

// 刷新令牌函数
export const refreshToken = async (): Promise<string> => {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) {
            throw new Error('没有可刷新的令牌');
        }

        // 创建一个不带拦截器的axios实例，避免循环调用
        const response = await apiClient.post('/auth/refresh-token', {}, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.data.code === 200 && response.data.data?.token) {
            const newToken = response.data.data.token;

            // 更新localStorage中的令牌
            localStorage.setItem('authToken', newToken);

            return newToken;
        } else {
            throw new Error(response.data.message || '令牌刷新失败');
        }
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data?.message || '令牌刷新请求失败');
        }
        throw new Error('令牌刷新请求失败，请检查网络连接');
    }
};

// 注册函数
export const register = async (data: { username: string; password: string }): Promise<any> => {
    try {
        const response = await apiClient.post(`/auth/register`, data);
        return response.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data?.message || '注册失败');
        }
        throw new Error('注册请求失败，请检查网络连接');
    }
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<any> => {
    try {
        const response = await apiClient.get(`/user/me`);
        return response.data.data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(error.response.data?.message || '获取用户信息失败');
        }
        throw new Error('获取用户信息请求失败，请检查网络连接');
    }
};

// 登出函数，清除 cookie 中的用户信息
export const logout = (): void => {
    removeCookie('userInfo');
    // API客户端会自动处理移除localStorage中的token
};