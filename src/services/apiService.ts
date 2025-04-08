import axios, { AxiosError } from 'axios';
import { removeCookie } from '../utils/cookies';

const API_URL = 'http://localhost:8080/api';

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_URL,
});

// 在非组件代码中保存logout函数的引用
let logoutHandler: (() => void) | null = null;

// 设置logout处理函数
export const setLogoutHandler = (handler: () => void) => {
    logoutHandler = handler;
};

// 标记是否正在刷新令牌
let isRefreshing = false;

// 存储等待令牌刷新的请求队列
let refreshSubscribers: ((token: string) => void)[] = [];

// 执行等待中的请求
const onRefreshed = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

// 添加一个请求到队列中
const addSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

// 刷新令牌函数
const refreshTokenRequest = async (): Promise<string> => {
    const token = localStorage.getItem('authToken');

    // 创建一个不带拦截器的axios实例，避免循环调用
    const refreshClient = axios.create({
        baseURL: API_URL,
    });

    const response = await refreshClient.post('/auth/refresh-token', {}, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.data.code === 200 && response.data.data?.token) {
        const newToken = response.data.data.token;
        localStorage.setItem('authToken', newToken);
        return newToken;
    } else {
        throw new Error('令牌刷新失败');
    }
};

// 请求拦截器 - 添加Authorization头
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // 确保使用 Bearer 格式
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理token过期
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // 如果是401错误（未授权，通常是token过期或无效）且不是刷新令牌的请求
        if (error.response?.status === 401 && !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh-token')) {

            // 如果已经在刷新，就加入等待队列
            if (isRefreshing) {
                return new Promise(resolve => {
                    addSubscriber((token: string) => {
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        resolve(apiClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 尝试刷新令牌
                const newToken = await refreshTokenRequest();

                // 更新当前请求的Authorization头
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                // 执行等待中的请求
                onRefreshed(newToken);

                isRefreshing = false;

                // 重试原始请求
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('令牌刷新失败:', refreshError);
                isRefreshing = false;

                // 清除本地存储中的认证信息
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                removeCookie('userInfo');

                // 如果已设置logoutHandler，则调用它
                if (logoutHandler) {
                    logoutHandler();
                }

                // 重定向到登录页面
                window.location.href = '/login';

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;