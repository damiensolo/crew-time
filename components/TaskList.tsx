import React, { useState } from 'react';
import TaskCard from './TaskCard';
import { TASKS } from '../constants';
import type { Task } from '../types';

const TaskList: React.FC = () => {
  const [expandedTaskId, setExpandedTaskId] = useState<number | null>(null);

  const handleToggle = (taskId: number) => {
    setExpandedTaskId(prevId => (prevId === taskId ? null : taskId));
  };

  return (
    <div className="space-y-3">
      {TASKS.map((task: Task) => (
        <TaskCard 
          key={task.id} 
          task={task}
          isExpanded={expandedTaskId === task.id}
          onToggle={() => handleToggle(task.id)}
        />
      ))}
    </div>
  );
};

export default TaskList;