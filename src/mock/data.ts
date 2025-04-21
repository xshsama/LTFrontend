import { Course } from '../types/course';
import { Achievement, Goal, Task } from '../types/goals';

export const mockCourseData: Course[] = [
    {
        id: 1,
        name: 'React 高级教程',
        description: 'React 高级特性与最佳实践',
        instructor: '张教授',
        startDate: '2025-03-01',
        endDate: '2025-06-30',
        status: '进行中',
        progress: 45,
        category: '前端开发',
        tags: ['React', 'TypeScript', '前端框架']
    },
    {
        id: 2,
        name: 'Spring Boot 实战',
        description: 'Spring Boot 企业级应用开发',
        instructor: '李教授',
        startDate: '2025-04-01',
        endDate: '2025-07-31',
        status: '进行中',
        progress: 30,
        category: '后端开发',
        tags: ['Java', 'Spring Boot', '后端框架']
    }
];

export const mockGoalData: Goal[] = [
    {
        id: 1,
        title: '完成 React Hooks 学习',
        priority: 'HIGH',
        status: 'ONGOING',
        progress: 45,
        createdAt: '2025-04-01T08:00:00Z',
        updatedAt: '2025-04-10T15:30:00Z',
        subjectId: 1,
        tags: ['React', 'Hooks']
    },
    {
        id: 2,
        title: '掌握 Spring Security',
        priority: 'MEDIUM',
        status: 'ONGOING',
        progress: 30,
        createdAt: '2025-04-02T09:00:00Z',
        updatedAt: '2025-04-10T16:45:00Z',
        subjectId: 2,
        tags: ['Java', 'Security']
    }
];

export const mockTaskData: Task[] = [
    {
        id: 1,
        title: '学习 useEffect 钩子',
        weight: 8,
        status: 'IN_PROGRESS',
        completionDate: undefined,
        actualTimeMinutes: 45,
        goalId: 1,
        createdAt: '2025-04-01T08:30:00Z',
        updatedAt: '2025-04-10T15:30:00Z',
        tags: [
            {
                id: 1,
                name: 'React',
                color: 'blue',
                userId: 1
            },
            {
                id: 2,
                name: 'Hooks',
                color: 'green',
                userId: 1
            }
        ]
    },
    {
        id: 2,
        title: '实现用户认证',
        weight: 9,
        status: 'NOT_STARTED',
        completionDate: undefined,
        actualTimeMinutes: 0,
        goalId: 2,
        createdAt: '2025-04-02T09:30:00Z',
        updatedAt: '2025-04-10T16:45:00Z',
        tags: [
            {
                id: 3,
                name: '认证',
                color: 'orange',
                userId: 1
            },
            {
                id: 4,
                name: '安全',
                color: 'red',
                userId: 1
            }
        ]
    }
];

export const mockAchievementData: Achievement[] = [
    {
        id: 1,
        title: '完成 React Router 学习',
        completionDate: '2025-03-30',
        type: '目标',
        relatedItemId: 1,
        relatedItemTitle: 'React 路由管理',
        description: '掌握了 React Router 的核心概念和实践应用',
        createdAt: '2025-03-30T10:00:00Z',
        updatedAt: '2025-03-30T10:00:00Z'
    },
    {
        id: 2,
        title: '实现数据库配置',
        completionDate: '2025-03-25',
        type: '任务',
        relatedItemId: 2,
        relatedItemTitle: '配置 Spring Data JPA',
        description: '成功配置并测试了数据库连接',
        createdAt: '2025-03-25T14:30:00Z',
        updatedAt: '2025-03-25T14:30:00Z'
    }
];
