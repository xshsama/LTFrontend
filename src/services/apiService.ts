import axios, { AxiosError, AxiosRequestHeaders } from 'axios';
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

// 从后端的自动刷新响应中提取令牌
const extractTokenFromRefreshResponse = (error: AxiosError): string | null => {
    try {
        // 检查响应数据是否包含刷新令牌
        const responseData = error.response?.data as any;
        console.log('收到401响应，检查是否包含刷新令牌:', responseData);

        if (responseData && responseData.error === 'TokenExpired') {
            console.log('识别到TokenExpired错误，尝试提取新令牌');

            // 尝试多种可能的结构获取令牌
            let token = null;

            // 方式1: 直接从refreshedToken对象获取
            if (responseData.refreshedToken && responseData.refreshedToken.token) {
                token = responseData.refreshedToken.token;
                console.log('方式1成功：从refreshedToken.token中提取到令牌');
            }
            // 方式2: 从data字段获取
            else if (responseData.refreshedToken && responseData.refreshedToken.data) {
                token = responseData.refreshedToken.data;
                console.log('方式2成功：从refreshedToken.data中提取到令牌');
            }
            // 方式3: refreshedToken本身就是令牌字符串
            else if (typeof responseData.refreshedToken === 'string') {
                token = responseData.refreshedToken;
                console.log('方式3成功：refreshedToken本身就是令牌字符串');
            }

            if (token) {
                console.log('成功从后端自动刷新响应中提取到令牌');
                return token;
            } else {
                console.warn('响应中存在TokenExpired错误，但无法提取到令牌:', responseData);
            }
        }
        return null;
    } catch (e) {
        console.error('解析自动刷新响应失败:', e);
        return null;
    }
};

// 请求拦截器 - 添加Authorization头
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            if (!config.headers) {
                config.headers = {
                    'Content-Type': 'application/json'
                } as AxiosRequestHeaders;
            }
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
    }, async (error: AxiosError) => {
        const originalRequest: any = error.config;
        console.log('捕获到请求错误:', error.response?.status, '路径:', originalRequest?.url);

        // 如果是401错误（未授权，通常是token过期或无效）且不是刷新令牌的请求
        if (error.response?.status === 401 && !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh-token')) {

            console.log('检测到401未授权错误，尝试刷新令牌');
            console.log('响应内容:', error.response?.data);

            // 首先检查响应中是否包含自动刷新的令牌
            const autoRefreshedToken = extractTokenFromRefreshResponse(error);

            if (autoRefreshedToken) {
                // 如果找到自动刷新的令牌，直接使用它
                console.log('成功获取自动刷新的令牌，长度:', autoRefreshedToken.length);

                // 保存新令牌
                localStorage.setItem('authToken', autoRefreshedToken);

                // 更新当前请求的Authorization头
                originalRequest.headers['Authorization'] = `Bearer ${autoRefreshedToken}`;

                // 如果其他请求正在等待令牌刷新，通知它们
                if (isRefreshing) {
                    onRefreshed(autoRefreshedToken);
                    isRefreshing = false;
                }

                // 重试原始请求
                return apiClient(originalRequest);
            }

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