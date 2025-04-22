import axios, { AxiosError, AxiosRequestHeaders } from 'axios';
import { removeCookie } from '../utils/cookies';

const API_URL = 'http://localhost:8080';

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// 在非组件代码中保存logout函数的引用
let logoutHandler: (() => void) | null = null;

// 设置logout处理函数
export const setLogoutHandler = (handler: () => void) => {
    logoutHandler = handler;
};

// 请求拦截器 - 添加Authorization头
apiClient.interceptors.request.use(
    (config) => {
        const url = config.url || '';

        // 跳过认证相关请求
        if (url.includes('/api/auth/') || url.includes('/auth/')) {
            return config;
        }

        const token = localStorage.getItem('authToken');
        // 添加调试日志
        console.log(`请求URL: ${url}, 令牌存在: ${!!token}`);

        if (token) {
            if (!config.headers) {
                config.headers = {} as AxiosRequestHeaders;
            }
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('已添加认证头:', `Bearer ${token.substring(0, 15)}...`);
        } else {
            console.warn('认证令牌不存在，请求可能会被拒绝');
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 响应拦截器 - 处理token过期
apiClient.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest: any = error.config;

        // 处理401未授权错误
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // 检查响应中是否包含后端自动刷新的令牌
                const responseData = error.response?.data as any;
                const refreshedToken = responseData?.refreshedToken ||
                    responseData?.data?.token;

                if (refreshedToken) {
                    // 保存新令牌
                    localStorage.setItem('authToken', refreshedToken);

                    // 更新请求头
                    originalRequest.headers = originalRequest.headers || {};
                    originalRequest.headers['Authorization'] = `Bearer ${refreshedToken}`;

                    // 重试原始请求
                    return apiClient(originalRequest);
                }

                // 如果响应中没有自动刷新令牌，尝试主动刷新令牌
                const token = localStorage.getItem('authToken');
                if (token) {
                    try {
                        console.log('尝试主动刷新令牌...');
                        const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh-token`,
                            { token },
                            { headers: { 'Content-Type': 'application/json' } }
                        );

                        if (refreshResponse.data?.code === 200 && refreshResponse.data?.data?.token) {
                            const newToken = refreshResponse.data.data.token;
                            console.log('令牌刷新成功');

                            // 保存新令牌
                            localStorage.setItem('authToken', newToken);

                            // 更新请求头
                            originalRequest.headers = originalRequest.headers || {};
                            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                            // 重试原始请求
                            return apiClient(originalRequest);
                        }
                    } catch (refreshError) {
                        console.error('主动刷新令牌失败:', refreshError);
                    }
                }

                // 如果刷新失败或没有令牌，跳转到登录页
                console.warn('认证失败，清除认证状态并跳转到登录页');
                localStorage.removeItem('authToken');
                removeCookie('userInfo');
                if (logoutHandler) logoutHandler();
                window.location.href = '/login';

            } catch (e) {
                console.error('处理令牌刷新失败:', e);
                localStorage.removeItem('authToken');
                removeCookie('userInfo');
                if (logoutHandler) logoutHandler();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
