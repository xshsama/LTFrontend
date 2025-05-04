import { Typography } from 'antd'
import React from 'react'
import '../styles/TaskSteps.css'
import { Step } from '../types/task'

const { Text } = Typography

interface StepItemProps {
  step: Step
}

const StepItem: React.FC<StepItemProps> = ({ step }) => {
  return (
    <div className="task-step-item">
      <div className="step-title">
        <Text
          delete={step.completed || step.status === 'DONE'}
          strong
        >
          {step.title}
        </Text>
        {step.estimatedDuration && (
          <Text
            type="secondary"
            className="step-duration"
          >
            预计: {step.estimatedDuration}分钟
          </Text>
        )}
      </div>

      {step.description && (
        <Text
          type="secondary"
          className="step-description"
        >
          {step.description}
        </Text>
      )}
    </div>
  )
}

interface TaskStepsListProps {
  steps: Step[]
}

const TaskStepsList: React.FC<TaskStepsListProps> = ({ steps }) => {
  if (!steps || steps.length === 0) {
    return null
  }

  return (
    <div className="task-steps">
      <Text strong>步骤:</Text>
      <ul className="steps-list">
        {steps.map((step) => (
          <li key={step.id}>
            <StepItem step={step} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TaskStepsList
