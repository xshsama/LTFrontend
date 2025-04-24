declare module '*.tsx' {
    import { ReactNode } from 'react'
    const component: ReactNode
    export default component
}

declare module './GanttChart' {
    import { FC } from 'react'
    import { Task } from '../types/task'

    interface GanttChartProps {
        tasks: Task[]
    }

    const GanttChart: FC<GanttChartProps>
    export default GanttChart
}

declare module './TodoList' {
    import { FC } from 'react'
    import { Task } from '../types/task'

    interface TodoListProps {
        tasks: Task[]
    }

    const TodoList: FC<TodoListProps>
    export default TodoList
}
