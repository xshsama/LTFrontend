import axios, { AxiosError, AxiosRequestHeaders } from 'axios';
import { removeCookie } from '../utils/cookies';

const API_URL = 'http://localhost:8080';

// 创建axios实例
const apiClient = axios.create({
    baseURL: API_URL,
    // 确保跨域请求时携带凭证
    withCredentials: true,
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

    const response = await refreshClient.post('/api/auth/refresh-token', {}, {
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

        if (responseData && (responseData.error === 'TokenExpired' || responseData.refreshedToken)) {
            console.log('识别到TokenExpired错误或直接包含refreshedToken，尝试提取新令牌');

            // 尝试多种可能的结构获取令牌
            let token = null;

            // 方式1: 直接从refreshedToken字段获取
            if (typeof responseData.refreshedToken === 'string') {
                token = responseData.refreshedToken;
                console.log('方式1成功：refreshedToken是字符串格式');
            }
            // 方式2: 从嵌套对象中获取
            else if (responseData.refreshedToken?.token) {
                token = responseData.refreshedToken.token;
                console.log('方式2成功：从refreshedToken.token中提取');
            }
            // 方式3: 从data字段获取
            else if (responseData.data?.token) {
                token = responseData.data.token;
                console.log('方式3成功：从data.token中提取');
            }

            if (token) {
                console.log('成功提取到新令牌，长度:', token.length);
                return token;
            } else {
                console.warn('无法从响应中提取令牌，响应结构:', responseData);
            }
        }
        return null;
    } catch (e) {
        console.error('解析自动刷新响应失败:', e);
        return null;
    }
};

// 请求拦截器 - 添加Authorization头（登录和注册请求除外）
apiClient.interceptors.request.use(
    (config) => {
        // 获取当前请求的URL路径
        const url = config.url || '';
        console.log(`处理请求: ${url}`);

        // 对登录、注册和刷新令牌请求不添加令牌 - 使用更精确的路径匹配
        // 确保路径匹配前端发出的实际请求路径
        // 注意: 后端控制器路径是 /api/auth/xxx
        if (url === '/api/auth/login' ||
            url === '/api/auth/register' ||
            url === '/api/auth/refresh-token' ||
            url.startsWith('/api/auth/') ||
            // 兼容没有/api前缀的路径
            url === '/auth/login' ||
            url === '/auth/register' ||
            url === '/auth/refresh-token' ||
            url.startsWith('/auth/')) {
            console.log(`认证相关请求: ${url}，跳过添加令牌`);
            return config;
        }

        const token = localStorage.getItem('authToken');
        if (token) {
            if (!config.headers) {
                config.headers = {
                    'Content-Type': 'application/json'
                } as AxiosRequestHeaders;
            }
            config.headers['Authorization'] = `Bearer ${token}`; // 确保使用 Bearer 格式
            console.log(`为请求 ${url} 添加令牌`);
        } else {
            console.log(`没有找到令牌，请求 ${url} 未添加Authorization头`);
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

            console.log('检测到401未授权错误，尝试处理');
            console.log('完整错误响应:', error.response);

            // 首先检查响应中是否包含自动刷新的令牌
            const autoRefreshedToken = extractTokenFromRefreshResponse(error);

            if (autoRefreshedToken) {
                console.log('成功获取自动刷新的令牌，长度:', autoRefreshedToken.length);
                console.log('令牌前20位:', autoRefreshedToken.substring(0, 20));

                // 保存新令牌
                localStorage.setItem('authToken', autoRefreshedToken);
                console.log('新令牌已保存到localStorage');

                // 更新当前请求的Authorization头
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${autoRefreshedToken}`;
                console.log('更新请求头完成');

                // 如果其他请求正在等待令牌刷新，通知它们
                if (isRefreshing) {
                    console.log('通知等待中的请求使用新令牌');
                    onRefreshed(autoRefreshedToken);
                    isRefreshing = false;
                }

                // 重试原始请求
                console.log('准备重试原始请求');
                return apiClient(originalRequest);
            }

            // 如果已经在刷新，就加入等待队列
            if (isRefreshing) {
                console.log('已有刷新请求在进行中，加入等待队列');
                return new Promise(resolve => {
                    addSubscriber((token: string) => {
                        originalRequest.headers = originalRequest.headers || {};
                        originalRequest.headers['Authorization'] = `Bearer ${token}`;
                        resolve(apiClient(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;
            console.log('开始主动刷新令牌流程');

            try {
                // 尝试刷新令牌
                const newToken = await refreshTokenRequest();
                console.log('刷新令牌成功，新令牌长度:', newToken.length);

                // 更新当前请求的Authorization头
                originalRequest.headers = originalRequest.headers || {};
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                // 执行等待中的请求
                console.log('通知等待中的请求使用新令牌');
                onRefreshed(newToken);

                isRefreshing = false;

                // 重试原始请求
                console.log('准备重试原始请求');
                return apiClient(originalRequest);
            } catch (refreshError) {
                console.error('令牌刷新失败:', refreshError);
                isRefreshing = false;

                // 清除本地存储中的认证信息
                localStorage.removeItem('authToken');
                localStorage.removeItem('user');
                removeCookie('userInfo');
                console.log('已清除认证信息');

                // 如果已设置logoutHandler，则调用它
                if (logoutHandler) {
                    console.log('调用logoutHandler');
                    logoutHandler();
                }

                // 重定向到登录页面
                console.log('重定向到登录页面');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
