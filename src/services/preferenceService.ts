import apiClient from './apiService';

// 用户偏好设置类型定义 (与后端 UserPreferenceDTO 对应)
export interface UserPreference {
    // 与 Settings.tsx 相关的字段
    theme?: string;
    emailNotifications?: boolean;
    taskReminderFrequency?: string; // 'daily', 'weekly', 'never'
    communityUpdatesEnabled?: boolean;
    achievementNotificationsEnabled?: boolean;
    defaultPage?: string; // 'dashboard', 'objectives', 'courses'
    fixedSidebarEnabled?: boolean; // 重命名自 sidebarFixed
    language?: string; // 暂时保留

    // 其他可能存在的字段 (暂时保留)
    showWelcome?: boolean;
    statsViewMode?: string;
    itemsPerPage?: number;
}

// 获取当前用户的偏好设置
export const getUserPreferences = async (): Promise<UserPreference> => {
    try {
        const response = await apiClient.get('/user/preferences');

        if (response.data?.code === 200) {
            if (response.data?.data) {
                return response.data.data;
            } else {
                // 如果数据为空，调用更新接口来触发后端初始化
                console.warn('未找到用户偏好设置，正在请求初始化...');
                // 调用更新接口，传入空对象触发后端的默认值初始化
                const initResponse = await updateUserPreferences({});
                return initResponse;
            }
        } else {
            throw new Error(response.data?.message || '获取偏好设置失败');
        }
    } catch (error) {
        console.error('获取偏好设置失败:', error);
        // 可以考虑返回一个默认对象，而不是抛出错误，以允许页面加载
        // return { theme: 'system', ... };
        throw error; // 或者继续抛出错误
    }
};

// 更新当前用户的偏好设置
export const updateUserPreferences = async (preferences: Partial<UserPreference>): Promise<UserPreference> => {
    try {
        // 过滤掉值为 undefined 的字段，避免发送不必要的 null 值
        const filteredPreferences = Object.entries(preferences).reduce((acc, [key, value]) => {
            if (value !== undefined) {
                // 使用类型断言来解决 TypeScript 错误
                (acc as any)[key] = value;
            }
            return acc;
        }, {} as Partial<UserPreference>);


        const response = await apiClient.put('/user/preferences', filteredPreferences);

        if (response.data?.code === 200 && response.data?.data) {
            return response.data.data;
        } else {
            throw new Error(response.data?.message || '更新偏好设置失败');
        }
    } catch (error) {
        console.error('更新偏好设置失败:', error);
        throw error;
    }
};
