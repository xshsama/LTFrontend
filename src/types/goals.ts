export type Priority = '高' | '中' | '低';
export type Status = '进行中' | '未开始' | '已完成';
export type AchievementType = '目标' | '任务';

export interface Goal {
    id: string;
    key: string;
    name: string;
    deadline: string;
    priority: Priority;
    status: Status;
    tags: string[];
    courseId: string;
}

export interface Task {
    key: string;
    name: string;
    deadline: string;
    priority: Priority;
    status: Status;
    relatedGoal: string;
    goalId: string;
    tags: string[];
}

export interface Achievement {
    key: string;
    name: string;
    completionDate: string;
    type: AchievementType;
    relatedItem: string;
    points: number;
    description?: string;
}