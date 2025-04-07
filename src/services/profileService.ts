import apiClient from './apiService';

// 用户个人资料类型定义
export interface UserProfile {
    username: string;
    nickname?: string;
    avatar?: string;
    bio?: string;
    birthday?: string;
    location?: string;
    education?: string;
    profession?: string;
    createdAt?: string; // 修改字段名以匹配后端
}

// 更新个人资料请求参数类型
export interface UpdateProfileRequest {
    nickname?: string;
    avatar?: string;
    bio?: string;
    birthday?: string;
    location?: string;
    education?: string;
    profession?: string;
}

// 获取当前用户的个人资料
export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        const response = await apiClient.get(`/profile`);
        return response.data.data; // ApiResponse 的 data 字段包含实际数据
    } catch (error) {
        console.error('获取个人资料失败:', error);
        throw error;
    }
};

// 更新当前用户的个人资料
export const updateUserProfile = async (profileData: UpdateProfileRequest): Promise<UserProfile> => {
    try {
        const response = await apiClient.put(`/profile`, profileData);
        return response.data.data;
    } catch (error) {
        console.error('更新个人资料失败:', error);
        throw error;
    }
};

// 上传用户头像
export const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        const response = await apiClient.post(`/profile/avatar`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data.data.avatar;
    } catch (error) {
        console.error('头像上传失败:', error);
        throw error;
    }
};