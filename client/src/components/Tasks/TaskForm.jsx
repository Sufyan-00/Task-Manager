import React, { useState, useEffect, useContext, useRef } from 'react';
import Select from 'react-select';
import { TaskContext } from '../../context/TaskContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../UI/LoadingSpinner';
import './TaskForm.css';

const TAG_OPTIONS = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'home', label: 'Home' },
  { value: 'school', label: 'School' },
  { value: 'shopping', label: 'Shopping' },
];

const PRIORITY_LABELS = {
  low: 'Low Priority',
  medium: 'Medium Priority',
  high: 'High Priority'
};

const initialState = {
  title: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  tags: [],
  notify: false,
  subtasks: []
};

function toLocalDatetimeInputValue(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset() * 60000;
  const localISO = new Date(date - tzOffset).toISOString().slice(0, 16);
  return localISO;
}

const TaskForm = ({ taskToEdit, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initialState);
  const [newSubtask, setNewSubtask] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);
  const formRef = useRef(null);
  const { createTask, updateTask, loading } = useContext(TaskContext);
  const { showError, showWarning } = useToast();

  useEffect(() => {
    // Trigger animation when component mounts
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (taskToEdit) {
      setForm({
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        dueDate: toLocalDatetimeInputValue(taskToEdit.dueDate),
        priority: taskToEdit.priority || 'medium',
        tags: taskToEdit.tags || [],
        notify: taskToEdit.notify ?? false,
        subtasks: taskToEdit.subtasks || []
      });
    } else {
      setForm(initialState);
    }
  }, [taskToEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleTagsChange = (selected) => {
    setForm({ ...form, tags: selected ? selected.map(opt => opt.value) : [] });
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setForm({
        ...form,
        subtasks: [...form.subtasks, { title: newSubtask.trim(), completed: false }]
      });
      setNewSubtask('');
    }
  };

  const removeSubtask = (index) => {
    setForm({
      ...form,
      subtasks: form.subtasks.filter((_, i) => i !== index)
    });
  };

  const toggleSubtask = (index) => {
    setForm({
      ...form,
      subtasks: form.subtasks.map((subtask, i) =>
        i === index ? { ...subtask, completed: !subtask.completed } : subtask
      )
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showError('Title is required');
      return;
    }
    if (form.dueDate && new Date(form.dueDate) < new Date()) {
      showWarning('Due date is in the past. Task will be marked as overdue.');
    }
    try {
      // Convert local datetime to UTC ISO string
      const dueDateUTC = form.dueDate
        ? new Date(form.dueDate).toISOString()
        : null;

      const taskData = {
        title: form.title.trim(),
        description: form.description.trim(),
        dueDate: dueDateUTC,
        priority: form.priority,
        tags: form.tags,
        notify: form.notify,
        subtasks: form.subtasks
      };
      if (taskToEdit) {
        await updateTask(taskToEdit._id, taskData);
      } else {
        await createTask(taskData);
        setForm(initialState);
      }
      if (onSubmit) onSubmit();
    } catch (err) {
      showError('Failed to save task');
    }
  };

  const minDateTime = new Date().toISOString().slice(0, 16);
  
  // Custom styles for react-select
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      borderColor: state.isFocused ? 'var(--primary-color)' : 'var(--gray-300)',
      boxShadow: state.isFocused ? '0 0 0 1px var(--primary-color)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? 'var(--primary-color)' : 'var(--gray-400)'
      },
      padding: '2px',
      borderRadius: 'var(--radius-sm)',
      opacity: loading ? 0.7 : 1
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? 'var(--primary-color)' 
        : state.isFocused 
          ? 'var(--primary-light)'
          : 'white',
      ':hover': {
        backgroundColor: state.isSelected ? 'var(--primary-color)' : 'var(--primary-light)'
      }
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'var(--primary-light)',
      borderRadius: 'var(--radius-sm)'
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: 'var(--primary-dark)',
      fontWeight: 500
    }),
    multiValueRemove: (base) => ({
      ...base,
      ':hover': {
        backgroundColor: 'var(--danger-light)',
        color: 'var(--danger-color)'
      }
    })
  };

  return (
    <div className={`task-form ${isAnimated ? 'task-form-animated' : ''}`} ref={formRef}>
      <div className="task-form-header">
        <h3 className="task-form-title">
          {taskToEdit ? 'Edit Task' : 'Create New Task'}
        </h3>
        <div className="form-underline"></div>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="task-form-group">
          <label className="task-form-label" htmlFor="title">
            Title <span className="required-field">*</span>
          </label>
          <input
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            disabled={loading}
            className={`task-form-input ${loading ? 'input-loading' : ''}`}
            placeholder="What needs to be done?"
          />
        </div>
        
        <div className="task-form-group">
          <label className="task-form-label" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            disabled={loading}
            className={`task-form-textarea ${loading ? 'input-loading' : ''}`}
            placeholder="Add details about this task..."
          />
        </div>
        
        <div className="form-row">
          <div className="task-form-group">
            <label className="task-form-label" htmlFor="dueDate">
              Due Date & Time
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="datetime-local"
              value={form.dueDate}
              onChange={handleChange}
              min={minDateTime}
              disabled={loading}
              className={`task-form-input ${loading ? 'input-loading' : ''}`}
            />
          </div>
          
          <div className="task-form-group">
            <label className="task-form-label" htmlFor="priority">
              Priority Level
            </label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              disabled={loading}
              className={`task-form-select ${loading ? 'input-loading' : ''}`}
            >
              <option value="low">{PRIORITY_LABELS.low}</option>
              <option value="medium">{PRIORITY_LABELS.medium}</option>
              <option value="high">{PRIORITY_LABELS.high}</option>
            </select>
          </div>
        </div>
        
        <div className="task-form-group">
          <label className="task-form-label" htmlFor="tags">
            Tags
          </label>
          <Select
            id="tags"
            isMulti
            options={TAG_OPTIONS}
            value={TAG_OPTIONS.filter(opt => form.tags.includes(opt.value))}
            onChange={handleTagsChange}
            placeholder="Select tags to categorize your task"
            closeMenuOnSelect={false}
            isDisabled={loading}
            styles={selectStyles}
            classNamePrefix="task-form-select"
          />
          <span className="form-field-hint">Tags help you organize and filter tasks</span>
        </div>
        
        <div className="subtasks-section">
          <label className="task-form-label subtasks-label">
            Subtasks
            <span className="form-field-hint subtask-hint">Break down your task into smaller steps</span>
          </label>
          
          <div className="subtask-input-group">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add a subtask..."
              disabled={loading}
              className={`subtask-input ${loading ? 'input-loading' : ''}`}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
            />
            <button 
              type="button" 
              onClick={addSubtask} 
              disabled={loading || !newSubtask.trim()} 
              className="subtask-add-btn"
              aria-label="Add subtask"
            >
              Add
            </button>
          </div>
          
          {form.subtasks.length > 0 ? (
            <div className="subtasks-list">
              {form.subtasks.map((subtask, index) => (
                <div key={index} className={`subtask-item ${subtask.completed ? 'is-completed' : ''}`}>
                  <div className="subtask-checkbox-wrapper">
                    <input
                      id={`subtask-${index}`}
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleSubtask(index)}
                      disabled={loading}
                      className="subtask-checkbox"
                    />
                    <label htmlFor={`subtask-${index}`} className="checkbox-label"></label>
                  </div>
                  <span className="subtask-text">
                    {subtask.title}
                  </span>
                  <button 
                    type="button" 
                    onClick={() => removeSubtask(index)} 
                    disabled={loading} 
                    className="subtask-remove-btn"
                    aria-label="Remove subtask"
                  >
                    <span className="remove-icon">×</span>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-subtasks">
              <p>No subtasks yet. Use subtasks to break down complex tasks.</p>
            </div>
          )}
        </div>
        
        <div className="task-form-group notification-group">
          <label className="task-form-checkbox-group" htmlFor="notify">
            <div className="checkbox-wrapper">
              <input
                id="notify"
                type="checkbox"
                name="notify"
                checked={form.notify}
                onChange={handleChange}
                disabled={loading}
                className="task-form-checkbox"
              />
              <span className="checkbox-custom"></span>
            </div>
            <div className="checkbox-label-text">
              <span>Enable Due Date Notification</span>
              <span className="form-field-hint">You will be notified when this task is due</span>
            </div>
          </label>
        </div>
        
        <div className="task-form-actions">
          <button 
            type="submit" 
            disabled={loading} 
            className="task-form-submit-btn"
          >
            {loading ? (
              <span className="button-with-spinner">
                <LoadingSpinner size="small" />
                <span>{taskToEdit ? 'Updating...' : 'Creating...'}</span>
              </span>
            ) : (
              <span className="btn-text">
                {taskToEdit ? 'Update Task' : 'Create Task'}
                <span className="btn-arrow">→</span>
              </span>
            )}
          </button>
          
          {taskToEdit && (
            <button 
              type="button" 
              onClick={onCancel} 
              disabled={loading} 
              className="task-form-cancel-btn"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;