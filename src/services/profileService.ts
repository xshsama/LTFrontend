import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

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
    const token = localStorage.getItem('authToken');

    try {
        const response = await axios.get(`${API_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        return response.data.data; // ApiResponse 的 data 字段包含实际数据
    } catch (error) {
        console.error('获取个人资料失败:', error);
        throw error;
    }
};

// 更新当前用户的个人资料
export const updateUserProfile = async (profileData: UpdateProfileRequest): Promise<UserProfile> => {
    const token = localStorage.getItem('authToken');

    try {
        const response = await axios.put(`${API_URL}/profile`, profileData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return response.data.data;
    } catch (error) {
        console.error('更新个人资料失败:', error);
        throw error;
    }
};

// 上传用户头像
export const uploadAvatar = async (file: File): Promise<string> => {
    const token = localStorage.getItem('authToken');
    const formData = new FormData();
    formData.append('avatar', file);

    try {
        // 注意：这个API端点需要在后端实现
        const response = await axios.post(`${API_URL}/profile/avatar`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data.data.avatar;
    } catch (error) {
        console.error('头像上传失败:', error);
        throw error;
    }
};