// frontend/src/context/TaskContext.jsx
import React, { createContext, useContext } from 'react';
import { useTasks } from '../features/tasks/hooks/useTasks';

const TaskContext = createContext();

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const taskData = useTasks();

  return (
    <TaskContext.Provider value={taskData}>
      {children}
    </TaskContext.Provider>
  );
};
