import axios, { AxiosError, AxiosRequestHeaders } from 'axios';
import { showReloginPrompt } from '../contexts/AuthContext';
import { removeCookie } from '../utils/cookies';
// import { url } from 'inspector'; // Removed due to naming conflict and not being used

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
        const currentUrl = config.url || ''; // Renamed to avoid conflict if 'url' import was intended elsewhere
        const method = config.method?.toUpperCase() || 'GET';

        // 跳过认证相关请求
        if (currentUrl.includes('/api/auth/') || currentUrl.includes('/auth/')) {
            console.log(`跳过认证请求: ${method} ${currentUrl}`);
            return config;
        }

        const token = localStorage.getItem('authToken');
        // 添加详细调试日志
        console.log(`准备发送请求: ${method} ${currentUrl}`);
        console.log(`认证状态: ${token ? '已登录' : '未登录'}`);

        if (token) {
            if (!config.headers) {
                config.headers = {} as AxiosRequestHeaders;
            }

            // 确保token没有额外的空格或换行符
            const cleanToken = token.trim();
            config.headers['Authorization'] = `Bearer ${cleanToken}`;

            // 打印部分token用于调试（只显示前10个字符和长度）
            const tokenPreview = cleanToken.substring(0, 10);
            console.log(`已添加认证头: Bearer ${tokenPreview}... (长度: ${cleanToken.length})`);

            // 如果是PUT或POST请求，记录请求体的大小
            if ((method === 'PUT' || method === 'POST') && config.data) {
                const dataSize = JSON.stringify(config.data).length;
                console.log(`请求体大小: ${dataSize} 字节`);

                // 对于更新任务相关的请求，打印更详细的请求信息
                if ((currentUrl.includes('/api/tasks/') || currentUrl.includes('/tasks/')) && currentUrl.includes('update')) {
                    console.log('任务更新请求数据:', config.data);
                }
            }
        } else {
            // 如果没有令牌
            console.warn(`⚠️ 请求未包含认证令牌: ${method} ${currentUrl} - 这可能导致403错误`);
            console.warn('⚠️ 认证令牌不存在，请求可能会被拒绝');

            // 对于需要认证的关键API，添加额外警告
            if (currentUrl.includes('/api/tasks/') || currentUrl.includes('/tasks/')) {
                console.error('❌ 尝试访问任务API但没有认证令牌，此请求很可能会失败');
            }
        }

        return config;
    },
    (error) => {
        console.error('请求拦截器错误:', error);
        return Promise.reject(error);
    }
);

// 响应拦截器 - 处理token过期和权限问题
apiClient.interceptors.response.use(
    (response) => {
        // 记录成功的API请求
        const url = response.config.url || '';
        console.log(`API请求成功: ${response.config.method?.toUpperCase()} ${url} (状态: ${response.status})`);
        return response;
    },
    async (error: AxiosError) => {
        const originalRequest: any = error.config;
        const url = originalRequest?.url || '(未知URL)';
        const status = error.response?.status || 'undefined';

        console.error(`API请求错误: ${originalRequest?.method?.toUpperCase()} ${url} (错误: ${status})`);

        if (error.response?.data) {
            console.error('错误细节:', error.response.data);
        }

        // 处理403权限错误 - 尝试刷新令牌
        if (error.response?.status === 403 && !originalRequest._retry) {
            console.log('权限错误(403)，尝试刷新令牌...');
            originalRequest._retry = true;

            // 尝试刷新令牌
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
        }

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
                // 使用可取消的重新登录提示
                showReloginPrompt();

            } catch (e) {
                console.error('处理令牌刷新失败:', e);
                localStorage.removeItem('authToken');
                removeCookie('userInfo');
                if (logoutHandler) logoutHandler();
                // 使用可取消的重新登录提示
                showReloginPrompt();
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
