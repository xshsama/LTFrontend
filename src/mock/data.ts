import { Course } from '../types/course';
import { Achievement, Goal, Task } from '../types/goals';

export const mockCourseData: Course[] = [
    {
        id: 'course1',
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
        id: 'course2',
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
        id: 'goal1',
        key: 'goal1',
        name: '完成 React Hooks 学习',
        deadline: '2025-04-30',
        priority: '高',
        status: '进行中',
        tags: ['React', 'Hooks'],
        courseId: 'course1'
    },
    {
        id: 'goal2',
        key: 'goal2',
        name: '掌握 Spring Security',
        deadline: '2025-05-31',
        priority: '中',
        status: '进行中',
        tags: ['Spring Boot', '安全'],
        courseId: 'course2'
    }
];

export const mockTaskData: Task[] = [
    {
        key: 'task1',
        name: '学习 useEffect 原理',
        deadline: '2025-04-15',
        priority: '高',
        status: '进行中',
        relatedGoal: '完成 React Hooks 学习',
        goalId: 'goal1',
        tags: ['React', 'Hooks']
    },
    {
        key: 'task2',
        name: '完成用户认证模块',
        deadline: '2025-05-15',
        priority: '高',
        status: '进行中',
        relatedGoal: '掌握 Spring Security',
        goalId: 'goal2',
        tags: ['Spring Boot', '认证']
    }
];

export const mockAchievementData: Achievement[] = [
    {
        key: 'achievement1',
        name: '完成 React Router 学习',
        completionDate: '2025-03-30',
        type: '目标',
        relatedItem: 'React 路由管理',
        points: 100,
        description: '掌握了 React Router 的核心概念和实践应用'
    }
];