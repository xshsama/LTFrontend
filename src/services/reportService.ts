// frontend/src/services/reportService.ts
import { LearningReport } from '../types/report';
import apiClient from './apiService';

interface GenerateReportParams {
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
    userId?: number;   // Optional: For admin to fetch report for a specific user
}

/**
 * Fetches the learning report from the backend.
 * @param params - The parameters for generating the report, including startDate, endDate, and optionally userId.
 * @returns A promise that resolves to the LearningReport data.
 */
export const getLearningReport = async (params: GenerateReportParams): Promise<LearningReport> => {
    try {
        console.log('Fetching learning report with params:', params);
        // The actual API endpoint might be /api/reports or /api/reports/learning
        // Adjust query parameter names if they differ in the backend implementation (e.g., start_date vs startDate)
        const response = await apiClient.get('/api/reports/learning', { params });

        console.log('Learning report API response:', response.data);
        // Assuming the backend returns data directly matching LearningReport structure
        // If backend wraps it, e.g., { data: LearningReport }, adjust access: return response.data.data;
        return response.data;
    } catch (error: any) {
        console.error('Failed to fetch learning report:', error.response?.data || error.message);
        // You might want to throw a more specific error or an error with a user-friendly message
        throw new Error(error.response?.data?.message || 'Failed to generate learning report.');
    }
};