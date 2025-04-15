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

// 定义密码更新请求参数类型
export interface UpdatePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// 获取当前用户的个人资料
export const getUserProfile = async (): Promise<UserProfile> => {
    try {
        // 修改请求路径，尝试不同的API端点
        console.log('正在请求用户个人资料...');


        const response = await apiClient.get(`api/profile`);
        console.log('API响应 (/profile):', response);

        // 检查响应数据的结构
        if (response.data?.code === 200) {
            // 标准的API响应格式
            return response.data.data;
        } else if (response.data) {
            // 直接返回数据
            return response.data;
        } else {
            throw new Error('无效的响应数据格式');
        }
    } catch (error) {
        console.error('获取个人资料失败:', error);
        throw error;
    }
};

// 更新当前用户的个人资料
export const updateUserProfile = async (profileData: UpdateProfileRequest): Promise<UserProfile> => {
    try {
        // 尝试不同的API端点
        console.log('正在更新用户个人资料:', profileData);

        // 首先尝试 /user/profile 路径
        try {
            const response = await apiClient.put(`/user/profile`, profileData);
            console.log('API响应 (/user/profile):', response);
            if (response.data && response.data.data) {
                return response.data.data;
            }
        } catch (err) {
            console.log('请求 /user/profile 失败，尝试备用路径');
        }

        // 如果第一个路径失败，尝试 /profile 路径
        const response = await apiClient.put(`/profile`, profileData);
        console.log('API响应 (/profile):', response);

        if (response.data?.code === 200) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        } else {
            throw new Error('无效的响应数据格式');
        }
    } catch (error) {
        console.error('更新个人资料失败:', error);
        throw error;
    }
};

// 更新用户密码
export const updatePassword = async (passwordData: UpdatePasswordRequest): Promise<boolean> => {
    try {
        const response = await apiClient.put(`/user/password`, passwordData);
        return response.data.code === 200;
    } catch (error) {
        console.error('密码更新失败:', error);
        throw error;
    }
};

// 上传用户头像 - 使用新的头像上传API
export const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        // 调用后端的头像上传API
        const response = await apiClient.post('avatar/upload/file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.code === 200 && response.data.data) {
            // 从响应中获取图片URL
            const imageUrl = response.data.data.data.url;
            return imageUrl;
        } else {
            throw new Error(response.data.message || '头像上传失败');
        }
    } catch (error: any) {
        console.error('头像上传失败:', error);
        throw new Error(error.response?.data?.message || '头像上传请求失败，请检查网络连接');
    }
};