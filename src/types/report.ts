// frontend/src/types/report.ts

// 基本统计信息
export interface ReportOverallStats {
    totalGoals: number;
    completedGoals: number;
    inProgressGoals: number;
    totalTasks: number;
    completedTasks: number;
    // totalLearningTimeMinutes?: number; // 如果有记录学习时长
    // averageTaskCompletionRate?: number; // 0-100
}

// 按学科/课程统计
export interface SubjectReportStats {
    subjectId: number;
    subjectTitle: string;
    totalGoals: number;
    completedGoals: number;
    totalTasks: number;
    completedTasks: number;
    // learningTimeMinutes?: number;
}

// 近期活动条目
export interface RecentActivityItem {
    id: number;
    title: string;
    type: 'GOAL' | 'TASK';
    status: string; // 例如 'COMPLETED', 'CREATED'
    date: string; // ISO Date string
}

// 图表数据点
export interface ChartDataPoint {
    label: string; // 例如日期 "2023-01", "周一"
    value: number; // 例如完成的任务数，学习时长
}

// 学习报告主结构
export interface LearningReport {
    userId: number;
    generatedAt: string; // ISO DateTime string
    reportStartDate: string; // ISO Date string
    reportEndDate: string; // ISO Date string
    overallStats: ReportOverallStats;
    subjectStats: SubjectReportStats[];
    recentActivities: RecentActivityItem[];
    aiSummary?: string; // AI生成的文本总结/分析
    // achievements?: AchievementReportItem[]; // 如果有成就模块
    tasksCompletedOverTime?: ChartDataPoint[]; // 例如，按周/月统计的任务完成数量
    // learningTimeDistribution?: ChartDataPoint[]; // 例如，按学科/任务类型统计的学习时长
}

// (可选) 成就回顾条目
// export interface AchievementReportItem {
//   id: number;
//   title: string;
//   description: string;
//   achievedDate: string; // ISO Date string
// }