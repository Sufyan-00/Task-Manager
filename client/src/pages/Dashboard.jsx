import React, { useState, useEffect, useContext, useRef } from 'react';
import TaskForm from '../components/Tasks/TaskForm';
import TaskList from '../components/Tasks/TaskList';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {  
  const [editingTask, setEditingTask] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { user } = useContext(AuthContext);
  const modalRef = useRef(null);


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 100);

    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  useEffect(() => {
    if (modalOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.classList.add('modal-open');
      document.body.style.paddingRight = `${scrollbarWidth}px`;

      const handleClickOutside = (e) => {
        if (modalRef.current && !modalRef.current.contains(e.target)) {
          closeModal();
        }
      };

      document.addEventListener('mousedown', handleClickOutside, true);

      return () => {
        document.body.classList.remove('modal-open');
        document.body.style.paddingRight = '';
        document.removeEventListener('mousedown', handleClickOutside, true);
      };
    }
  }, [modalOpen]);

  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (modalOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [modalOpen]);

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleFormSubmit = () => {
    setEditingTask(null);
    closeModal();
  };

  const openModal = () => {
    setModalOpen(true);
    setEditingTask(null);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTimeout(() => {
      setEditingTask(null);
    }, 300);
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <>
      <div className={`dashboard ${loaded ? 'dashboard-loaded' : ''}`}>
        <div className="dashboard-header">
          <div className="dashboard-greeting">
            <h1>
              <span className="greeting-text">{getGreeting()},</span>
              <span className="user-name">{user?.name || 'there'}</span>
            </h1>
            <div className="dashboard-datetime">
              <p className="dashboard-date">{currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</p>
              <span className="dashboard-time">{formatTime()}</span>
            </div>
          </div>
          <button
            className="add-task-btn"
            onClick={openModal}
            aria-label="Add new task"
          >
            <span className="add-task-btn-text">Add Task</span>
            <span className="add-task-btn-icon">+</span>
            <div className="btn-background"></div>
          </button>
        </div>
        <div className="dashboard-content">
          <div className="dashboard-list-section full-width">
            <TaskList onEdit={handleEdit} />
          </div>
        </div>
      </div>
      <button
        className="floating-add-btn"
        onClick={openModal}
        aria-label="Add new task"
        type="button">
      </button>
      <div className={`task-modal-overlay ${modalOpen ? 'modal-visible' : ''}`}>
        <div
          className={`task-modal ${modalOpen ? 'modal-visible' : ''}`}
          ref={modalRef}
        >
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={closeModal}
              aria-label="Close modal"
            >
              <span className="close-icon">x</span>
            </button>
            <TaskForm
              taskToEdit={editingTask}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;