import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import Select from 'react-select';
import { TaskContext } from '../../context/TaskContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../utils/api';
import TaskItem from './TaskItem';
import LoadingSpinner from '../UI/LoadingSpinner';
import './TaskList.css';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const handleExport = async (type) => {
  try {
    // Create a timestamp using local date/time format
    const now = new Date();
    
    // Format: YYYY-MM-DD_HH-MM-SS
    const timestamp = now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + '_' + 
      String(now.getHours()).padStart(2, '0') + '-' + 
      String(now.getMinutes()).padStart(2, '0') + '-' + 
      String(now.getSeconds()).padStart(2, '0');
    
    const filename = `tasks_${timestamp}.${type === 'csv' ? 'csv' : 'pdf'}`;
    
    // Request the export
    const res = await api.get(`/tasks/export?type=${type}`, { responseType: 'blob' });
    
    // Create a download link
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error(`Error exporting ${type}:`, error);
  }
};
const TAG_OPTIONS = [
  { value: 'work', label: 'Work' },
  { value: 'personal', label: 'Personal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'home', label: 'Home' },
  { value: 'school', label: 'School' },
  { value: 'shopping', label: 'Shopping' },
];

function useDueDateNotifications(tasks) {
  useEffect(() => {
    if (!("Notification" in window)) return;
    Notification.requestPermission();

    const now = new Date();
    const soon = new Date(now.getTime() + 60 * 60 * 1000);

    tasks.forEach(task => {
      if (
        task.notify &&
        !task.completed &&
        task.dueDate &&
        new Date(task.dueDate) > now &&
        new Date(task.dueDate) <= soon &&
        !task._notified
      ) {
        new Notification(`Task Due Soon: ${task.title}`, {
          body: `Your task "${task.title}" is due at ${new Date(task.dueDate).toLocaleTimeString()}.`,
        });
        task._notified = true;
      }
    });
  }, [tasks]);
}

const TaskList = ({ onEdit }) => {
  const { tasks, deleteTask, toggleTask, fetchTasks, loading, currentUser } = useContext(TaskContext);
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [tags, setTags] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [sharePermission, setSharePermission] = useState('view');
  const [showShareForm, setShowShareForm] = useState(null);
  const [localLoading, setLocalLoading] = useState(false);
  const tasksContainerRef = useRef(null);
  const [contentChanged, setContentChanged] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'list' or 'grid'

  // Use useMemo for filtered tasks
  const debouncedSearch = useDebounce(searchInput, 500);

  // Compute filtered tasks with useMemo
  const filteredTasks = useMemo(() => {
    if (!debouncedSearch) return tasks;
    const search = debouncedSearch.toLowerCase();
    return tasks.filter(
      t =>
        t.title.toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search))
    );
  }, [tasks, debouncedSearch]);

  // Compute ordered tasks with useMemo
  const orderedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [filteredTasks]);

  // When filters change, fetch from server with loading indicator
  useEffect(() => {
    const fetchData = async () => {
      setLocalLoading(true);
      await fetchTasks({ status, priority, tags: tags.join(',') });
      setLocalLoading(false);
    };
    fetchData();
    // eslint-disable-next-line
  }, [status, priority, tags]);
  
  // Animation effect when tasks change
  useEffect(() => {
    if (tasksContainerRef.current && contentChanged) {
      tasksContainerRef.current.classList.add('content-changed');
      setTimeout(() => {
        if (tasksContainerRef.current) {
          tasksContainerRef.current.classList.remove('content-changed');
        }
        setContentChanged(false);
      }, 300);
    }
  }, [contentChanged, orderedTasks]);
  
  useDueDateNotifications(orderedTasks);

  const handleSearchChange = (e) => {
    setSearchInput(e.target.value);
    setContentChanged(true);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    const reordered = Array.from(orderedTasks);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);

    setLocalLoading(true);
    try {
      await api.post('/tasks/reorder', {
        orderedIds: reordered.map(t => t._id)
      });
      await fetchTasks({ status, priority, tags: tags.join(',') });
      setContentChanged(true);
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSubtaskToggle = async (taskId, subtaskId, completed) => {
    setLocalLoading(true);
    try {
      await api.patch(`/tasks/${taskId}/subtasks/${subtaskId}`, { completed });
      await fetchTasks({ status, priority, tags: tags.join(',') });
      setContentChanged(true);
    } catch (err) {
      // Optionally handle error silently
    } finally {
      setLocalLoading(false);
    }
  };

  const handleShare = async (taskId) => {
    setLocalLoading(true);
    try {
      await api.post(`/tasks/${taskId}/share`, {
        userEmail: shareEmail,
        permission: sharePermission
      });
      setShareEmail('');
      setShowShareForm(null);
      await fetchTasks({ status, priority, tags: tags.join(',') });
      setContentChanged(true);
    } catch (err) {
      // Optionally handle error silently
    } finally {
      setLocalLoading(false);
    }
  };

  const handleUnshare = async (taskId, userId) => {
    setLocalLoading(true);
    try {
      await api.post(`/tasks/${taskId}/unshare`, { userId });
      await fetchTasks({ status, priority, tags: tags.join(',') });
      setContentChanged(true);
    } catch (err) {
      // Optionally handle error silently
    } finally {
      setLocalLoading(false);
    }
  };

  const getCurrentUserId = () => {
    if (!currentUser) return null;
    return currentUser._id || currentUser.id;
  };

  const getTaskOwnerId = (task) => {
    if (!task) return null;
    if (task.createdBy) {
      return typeof task.createdBy === 'object' ? task.createdBy._id : task.createdBy;
    }
    if (task.user) {
      return typeof task.user === 'object' ? task.user._id : task.user;
    }
    return null;
  };

  const isOwner = (task) => {
    const currentUserId = getCurrentUserId();
    const taskOwnerId = getTaskOwnerId(task);
    return currentUserId && taskOwnerId && currentUserId === taskOwnerId;
  };

  const canEdit = (task) => {
    if (isOwner(task)) return true;
    const currentUserId = getCurrentUserId();
    if (!currentUserId || !task.sharedWith) return false;
    const sharedUser = task.sharedWith.find(share => {
      const shareUserId = typeof share.user === 'object' ? share.user._id : share.user;
      return shareUserId === currentUserId;
    });
    return sharedUser?.permission === 'edit';
  };

  const isSharedTask = (task) => {
    return !isOwner(task) && task.sharedWith && task.sharedWith.length > 0;
  };

  const getTaskOwnerEmail = (task) => {
    if (task.createdBy && typeof task.createdBy === 'object') {
      return task.createdBy.email;
    }
    return 'Unknown';
  };

  const clearFilters = () => {
    setStatus('');
    setPriority('');
    setTags([]);
    setSearchInput('');
    setContentChanged(true);
  };

  if (loading && !localLoading) {
    return (
      <div className="loading-state">
        <LoadingSpinner size="large" />
        <p className="loading-text">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <div className="task-list-header">
        <h3 className="task-list-title">
          Your Tasks <span className="task-list-count">({filteredTasks.length})</span>
        </h3>
        <div className="task-list-actions">
          <div className="view-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} 
              onClick={() => setViewMode('list')}
              aria-label="List view"
              title="List view"
            >
              List
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`} 
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              title="Grid view"
            >
              Grid
            </button>
          </div>
          <div className="export-buttons">
            <button onClick={() => handleExport('csv')} className="export-btn" disabled={localLoading}>
              Export CSV
            </button>
            <button onClick={() => handleExport('pdf')} className="export-btn" disabled={localLoading}>
              Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="Search tasks..."
          value={searchInput}
          onChange={handleSearchChange}
          className={`search-input ${localLoading ? 'loading' : ''}`}
          disabled={localLoading}
        />
        {searchInput && (
          <span className="search-results-counter">
            {filteredTasks.length} result{filteredTasks.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="task-filters">
        <div className="filter-group">
          <label className="filter-label">Status</label>
          <select 
            value={status} 
            onChange={e => {
              setStatus(e.target.value);
              setContentChanged(true);
            }}
            className={`filter-select ${localLoading ? 'loading' : ''}`}
            disabled={localLoading}
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Priority</label>
          <select 
            value={priority} 
            onChange={e => {
              setPriority(e.target.value);
              setContentChanged(true);
            }}
            className={`filter-select ${localLoading ? 'loading' : ''}`}
            disabled={localLoading}
          >
            <option value="">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Tags</label>
          <Select
            isMulti
            options={TAG_OPTIONS}
            value={TAG_OPTIONS.filter(opt => tags.includes(opt.value))}
            onChange={selected => {
              setTags(selected ? selected.map(opt => opt.value) : []);
              setContentChanged(true);
            }}
            placeholder="Filter by tags"
            closeMenuOnSelect={false}
            isClearable
            isDisabled={localLoading}
            className={localLoading ? 'react-select-loading' : ''}
          />
        </div>

        <button 
          onClick={clearFilters} 
          className="clear-filters-btn"
          disabled={localLoading}
        >
          Clear Filters
        </button>
      </div>

      <div className="tasks-container-wrapper" ref={tasksContainerRef}>
        {orderedTasks.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-title">No tasks found</p>
            <p className="empty-state-text">Create your first task to get started!</p>
          </div>
        ) : (
          <div className="tasks-content">
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="taskList">
                {(provided) => (
                  <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef}
                    className={`tasks-container ${viewMode === 'grid' ? 'grid-view' : 'list-view'} ${localLoading ? 'loading' : ''}`}
                  >
                    {orderedTasks.map((task, idx) => (
                      <Draggable key={task._id} draggableId={task._id} index={idx}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-draggable ${snapshot.isDragging ? 'is-dragging' : ''}`}
                            data-view-mode={viewMode}
                          >
                            <TaskItem
                              task={task}
                              onEdit={onEdit}
                              deleteTask={deleteTask}
                              toggleTask={toggleTask}
                              handleSubtaskToggle={handleSubtaskToggle}
                              handleShare={handleShare}
                              handleUnshare={handleUnshare}
                              showShareForm={showShareForm}
                              setShowShareForm={setShowShareForm}
                              shareEmail={shareEmail}
                              setShareEmail={setShareEmail}
                              sharePermission={sharePermission}
                              setSharePermission={setSharePermission}
                              isOwner={isOwner}
                              canEdit={canEdit}
                              isSharedTask={isSharedTask}
                              getTaskOwnerEmail={getTaskOwnerEmail}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            {localLoading && (
              <div className="tasks-overlay">
                <LoadingSpinner overlay />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;