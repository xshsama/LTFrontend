export interface Course {
    id: number;
    name: string;
    description: string;
    instructor: string;
    startDate: string;
    endDate: string;
    status: '未开始' | '进行中' | '已完成' | '已暂停';
    progress: number;
    category: string;
    tags: string[];
}