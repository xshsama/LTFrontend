import apiClient from './apiService';

/**
 * ImgBB上传响应中的图片信息
 */
export interface UploadedImage {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
        filename: string;
        name: string;
        mime: string;
        extension: string;
        url: string;
    };
    thumb: {
        filename: string;
        name: string;
        mime: string;
        extension: string;
        url: string;
    };
    medium: {
        filename: string;
        name: string;
        mime: string;
        extension: string;
        url: string;
    };
    delete_url: string;
}

/**
 * 图片上传响应
 */
export interface ImageUploadResponse {
    data: UploadedImage;
    success: boolean;
    status: number;
}

/**
 * 通过文件上传图片
 * @param file 要上传的图片文件
 * @param name 可选的图片名称
 * @param expiration 可选的图片过期时间（秒）
 * @returns 上传成功后的图片信息
 */
export const uploadImageFile = async (
    file: File,
    name?: string,
    expiration?: number
): Promise<UploadedImage> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        if (name) {
            formData.append('name', name);
        }

        if (expiration) {
            formData.append('expiration', expiration.toString());
        }

        const response = await apiClient.post('/api/avatar/upload/file', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (response.data.code === 200 && response.data.data) {
            return response.data.data.data; // 返回嵌套在data中的实际图片信息
        } else {
            throw new Error(response.data.message || '图片上传失败');
        }
    } catch (error: any) {
        console.error('图片上传失败:', error);
        throw new Error(error.response?.data?.message || '图片上传请求失败，请检查网络连接');
    }
};

/**
 * 通过Base64字符串上传图片
 * @param base64Image Base64编码的图片数据
 * @param name 可选的图片名称
 * @param expiration 可选的图片过期时间（秒）
 * @returns 上传成功后的图片信息
 */
export const uploadImageBase64 = async (
    base64Image: string,
    name?: string,
    expiration?: number
): Promise<UploadedImage> => {
    try {
        const data = {
            image: base64Image,
            name,
            expiration
        };

        const response = await apiClient.post('/api/avatar/upload/base64', data);

        if (response.data.code === 200 && response.data.data) {
            return response.data.data.data; // 返回嵌套在data中的实际图片信息
        } else {
            throw new Error(response.data.message || '图片上传失败');
        }
    } catch (error: any) {
        console.error('图片上传失败:', error);
        throw new Error(error.response?.data?.message || '图片上传请求失败，请检查网络连接');
    }
};