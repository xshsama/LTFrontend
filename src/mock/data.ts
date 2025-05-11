import { Course } from 'types/course';
import { Achievement, Goal, Task } from 'types/goals'; // Re-added Tag import

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
        createdAt: new Date('2025-04-01T08:00:00Z'), // Convert to Date object
        updatedAt: new Date('2025-04-10T15:30:00Z'), // Convert to Date object
        subjectId: 1,
        tags: [
            {
                id: 1,
                title: 'React',
                color: 'blue',
                userId: 1
            },
            {
                id: 2,
                title: 'Hooks',
                color: 'green',
                userId: 1
            }
        ]
    },
    {
        id: 2,
        title: '掌握 Spring Security',
        priority: 'MEDIUM',
        status: 'ONGOING', // Correct status
        progress: 30,
        createdAt: new Date('2025-04-02T09:00:00Z'), // Convert to Date object
        updatedAt: new Date('2025-04-10T16:45:00Z'), // Convert to Date object
        subjectId: 2,
        tags: [
            {
                id: 3,
                title: 'Java',
                color: 'red',
                userId: 1
            },
            {
                id: 4,
                title: 'Security',
                color: 'orange',
                userId: 1
            }
        ]
    }
];

export const mockTaskData: Task[] = [
    {
        id: 1,
        title: '学习 useEffect 钩子',
        weight: 8,
        status: 'IN_PROGRESS',
        type: 'STEP', // 添加任务类型
        completionDate: undefined,
        priority: 'HIGH', // 添加必需的priority属性
        studyHours: 3, // 添加必需的studyHours属性
        actualTimeMinutes: 45,
        goalId: 1,
        createdAt: new Date('2025-04-01T08:30:00Z'), // Convert to Date object
        updatedAt: new Date('2025-04-10T15:30:00Z'), // Convert to Date object
        tags: [
            {
                id: 1,
                title: 'React',
                color: 'blue',
                userId: 1
            },
            {
                id: 2,
                title: 'Hooks',
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
        type: 'STEP', // 添加任务类型
        completionDate: undefined,
        priority: 'MEDIUM', // 添加必需的priority属性
        studyHours: 5, // 添加必需的studyHours属性
        actualTimeMinutes: 0,
        goalId: 2,
        createdAt: new Date('2025-04-02T09:30:00Z'), // Convert to Date object
        updatedAt: new Date('2025-04-10T16:45:00Z'), // Convert to Date object
        tags: [
            {
                id: 3,
                title: '认证',
                color: 'orange',
                userId: 1
            },
            {
                id: 4,
                title: '安全',
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
        completionDate: new Date('2025-03-30'), // Convert to Date object
        type: '目标',
        relatedItemId: 1,
        relatedItemTitle: 'React 路由管理',
        description: '掌握了 React Router 的核心概念和实践应用',
        createdAt: new Date('2025-03-30T10:00:00Z'), // Convert to Date object
        updatedAt: new Date('2025-03-30T10:00:00Z') // Convert to Date object
    },
    {
        id: 2,
        title: '实现数据库配置',
        completionDate: new Date('2025-03-25'), // Convert to Date object
        type: '任务',
        relatedItemId: 2,
        relatedItemTitle: '配置 Spring Data JPA',
        description: '成功配置并测试了数据库连接',
        createdAt: new Date('2025-03-25T14:30:00Z'), // Convert to Date object
        updatedAt: new Date('2025-03-25T14:30:00Z') // Convert to Date object
    }
];
