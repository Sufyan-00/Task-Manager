import React, { createContext, useReducer, useContext } from 'react';
import { AuthContext } from './AuthContext';
import api from '../utils/api';

const TaskContext = createContext();

const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task =>
          task._id === action.payload._id ? action.payload : task
        )
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter(task => task._id !== action.payload)
      };
    default:
      return state;
  }
};

const TaskProvider = ({ children }) => {
  const [state, dispatch] = useReducer(taskReducer, { tasks: [], loading: false });
  const { user } = useContext(AuthContext);

  const fetchTasks = async (filters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.tags) params.tags = filters.tags;
      if (filters.search) params.search = filters.search;
      
      const { data } = await api.get('/tasks', { params });
      dispatch({ type: 'SET_TASKS', payload: data });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

 const createTask = async (taskData) => {
  try {
    console.log('=== FRONTEND CREATE TASK DEBUG ===');
    console.log('Creating task with data:', taskData);
    console.log('Current user in context:', user);
    
    const { data } = await api.post('/tasks', taskData);
    console.log('Task created response:', data);
    
    dispatch({ type: 'ADD_TASK', payload: data });
    return data;
  } catch (error) {
    console.error('Failed to create task:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};
  const updateTask = async (id, taskData) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, taskData);
      dispatch({ type: 'UPDATE_TASK', payload: data });
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      dispatch({ type: 'DELETE_TASK', payload: id });
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };

  const toggleTask = async (id) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/toggle`);
      dispatch({ type: 'UPDATE_TASK', payload: data });
    } catch (error) {
      console.error('Failed to toggle task:', error);
      throw error;
    }
  };

  return (
    <TaskContext.Provider value={{
      tasks: state.tasks,
      loading: state.loading,
      currentUser: user,
      fetchTasks,
      createTask,
      updateTask,
      deleteTask,
      toggleTask
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export { TaskContext, TaskProvider };