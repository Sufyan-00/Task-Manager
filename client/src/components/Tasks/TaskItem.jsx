import React from "react";
import "./TaskItem.css";

// Use React.memo for performance optimization
const TaskItem = React.memo(
  ({
    task,
    onEdit,
    deleteTask,
    toggleTask,
    handleSubtaskToggle,
    handleShare,
    handleUnshare,
    showShareForm,
    setShowShareForm,
    shareEmail,
    setShareEmail,
    sharePermission,
    setSharePermission,
    isOwner,
    canEdit,
    isSharedTask,
    getTaskOwnerEmail,
  }) => {
    const dueDatePassed = task.dueDate && new Date(task.dueDate) < new Date();
    const userIsOwner = isOwner(task);
    const userCanEdit = canEdit(task);
    const taskIsShared = isSharedTask(task);

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Format time
      const timeOptions = { hour: "numeric", minute: "numeric" };
      const timeStr = date.toLocaleTimeString(undefined, timeOptions);

      // Check if it's today, tomorrow, or within a week
      if (date.toDateString() === today.toDateString()) {
        return `Today at ${timeStr}`;
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return `Tomorrow at ${timeStr}`;
      } else if ((date - today) / (1000 * 60 * 60 * 24) < 7) {
        // Within a week - show day name
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        return `${days[date.getDay()]} at ${timeStr}`;
      } else {
        // More than a week away - show full date
        return (
          date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year:
              date.getFullYear() !== today.getFullYear()
                ? "numeric"
                : undefined,
          }) + ` at ${timeStr}`
        );
      }
    };

    return (
      <div
        className={`task-item ${task.completed ? "completed" : ""} ${
          dueDatePassed && !task.completed ? "overdue" : ""
        } priority-${task.priority}`}
      >
        <div className="task-item-header">
          <div className="task-item-main">
            <div className="task-title-section">
              <div className="task-checkbox-wrapper">
                <input
                  type="checkbox"
                  id={`task-${task._id}`}
                  checked={task.completed}
                  onChange={() => toggleTask(task._id)}
                  disabled={!userCanEdit}
                  className="task-checkbox"
                />
                <label
                  htmlFor={`task-${task._id}`}
                  className="checkbox-custom"
                ></label>
              </div>

              <div className="task-title-wrapper">
                <h4
                  className={`task-title ${task.completed ? "completed" : ""} ${
                    dueDatePassed && !task.completed ? "overdue" : ""
                  }`}
                >
                  {task.title}
                </h4>

                <div className="task-indicators">
                  {taskIsShared && (
                    <span
                      className="task-indicator shared-indicator"
                      title={`Shared by ${getTaskOwnerEmail(task)}`}
                    >
                      <span className="indicator-label">Shared</span>
                    </span>
                  )}

                  {dueDatePassed && !task.completed && (
                    <span className="task-indicator overdue-indicator">
                      <span className="indicator-label">Overdue</span>
                    </span>
                  )}

                  <span
                    className={`task-indicator priority-indicator priority-${task.priority}`}
                    title={`Priority: ${task.priority}`}
                  >
                    <span className="indicator-label">{task.priority}</span>
                  </span>
                </div>
              </div>
            </div>

            {task.description && (
              <p className="task-description">{task.description}</p>
            )}

            <div className="progress-section">
              <div className="progress-label">
                <span className="progress-percent">{task.progress || 0}%</span>{" "}
                Complete
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-fill ${
                    (task.progress || 0) === 100 ? "completed" : ""
                  }`}
                  style={{ width: `${task.progress || 0}%` }}
                />
              </div>
            </div>

            <div className="task-meta">
              {task.dueDate && (
                <span
                  className={`task-meta-item due-date ${
                    dueDatePassed && !task.completed ? "overdue" : ""
                  }`}
                >
                  <span className="meta-icon">Due</span>
                  <span className="meta-text">{formatDate(task.dueDate)}</span>
                </span>
              )}

              {task.notify && (
                <span
                  className="task-meta-item notifications"
                >
                  <span className="meta-icon">
                    {task.notified ? "Notified" : "Notify"}
                  </span>
                </span>
              )}

              {task.tags && task.tags.length > 0 && (
                <div className="task-tags">
                  {task.tags.map((tag) => (
                    <span key={tag} className="task-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {task.subtasks && task.subtasks.length > 0 && (
              <div className="subtasks-section">
                <div className="subtasks-title">
                  Subtasks{" "}
                  <span className="subtask-count">
                    ({task.subtasks.filter((st) => st.completed).length}/
                    {task.subtasks.length})
                  </span>
                </div>
                <div className="subtasks-list">
                  {task.subtasks.map((subtask) => (
                    <div key={subtask._id} className="subtask-item">
                      <div className="subtask-checkbox-wrapper">
                        <input
                          type="checkbox"
                          id={`subtask-${subtask._id}`}
                          checked={subtask.completed}
                          onChange={(e) =>
                            handleSubtaskToggle(
                              task._id,
                              subtask._id,
                              e.target.checked
                            )
                          }
                          disabled={!userCanEdit}
                          className="subtask-checkbox"
                        />
                        <label
                          htmlFor={`subtask-${subtask._id}`}
                          className="subtask-checkbox-custom"
                        ></label>
                      </div>
                      <span
                        className={`subtask-text ${
                          subtask.completed ? "completed" : ""
                        }`}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userIsOwner && task.sharedWith && task.sharedWith.length > 0 && (
              <div className="sharing-section">
                <div className="sharing-title">
                  Shared with{" "}
                  <span className="sharing-count">
                    ({task.sharedWith.length})
                  </span>
                </div>
                <div className="shared-users-list">
                  {task.sharedWith.map((share) => (
                    <div
                      key={share.user?._id || share._id}
                      className="shared-user"
                    >
                      <span className="shared-user-info">
                        <span className="user-email">
                          {share.user?.email || "unknown"}
                        </span>
                        <span className="user-permission">
                          {share.permission}
                        </span>
                      </span>
                      <button
                        onClick={() =>
                          handleUnshare(task._id, share.user?._id || share._id)
                        }
                        className="unshare-btn"
                        aria-label={`Remove access for ${
                          share.user?.email || "unknown"
                        }`}
                      >
                        <span className="unshare-icon">×</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {userIsOwner && showShareForm === task._id && (
              <div className="share-form">
                <div className="share-form-header">
                  <span className="share-form-title">Share this task</span>
                </div>

                <div className="share-form-inputs">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="share-email-input"
                  />
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value)}
                    className="share-permission-select"
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Can Edit</option>
                  </select>
                </div>

                <div className="share-form-actions">
                  <button
                    onClick={() => handleShare(task._id)}
                    className="share-btn"
                  >
                    <span className="btn-text">Share</span>
                  </button>
                  <button
                    onClick={() => setShowShareForm(null)}
                    className="cancel-share-btn"
                  >
                    <span className="btn-text">Cancel</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="task-item-actions">
            {!task.completed && (
              <button
                onClick={() => toggleTask(task._id)}
                disabled={!userCanEdit}
                className="task-action-btn complete-btn"
                aria-label="Mark as complete"
                title="Mark as complete"
              >
                <span className="action-text">Complete</span>
              </button>
            )}

            {task.completed && (
              <button
                onClick={() => toggleTask(task._id)}
                disabled={!userCanEdit}
                className="task-action-btn incomplete-btn"
                aria-label="Mark as incomplete"
                title="Mark as incomplete"
              >
                <span className="action-text">Undo</span>
              </button>
            )}

            <button
              onClick={() => userCanEdit && onEdit && onEdit(task)}
              disabled={!userCanEdit}
              className="task-action-btn edit-btn"
              aria-label="Edit task"
              title="Edit task"
            >
              <span className="action-text">Edit</span>
            </button>

            {userIsOwner && (
              <button
                onClick={() => deleteTask(task._id)}
                className="task-action-btn delete-btn"
                aria-label="Delete task"
                title="Delete task"
              >
                <span className="action-text">Delete</span>
              </button>
            )}

            {userIsOwner && (
              <button
                onClick={() =>
                  setShowShareForm(showShareForm === task._id ? null : task._id)
                }
                className={`task-action-btn share-btn ${
                  showShareForm === task._id ? "active" : ""
                }`}
                aria-label="Share task"
                title="Share task"
              >
                <span className="action-text">
                  {showShareForm === task._id ? "Cancel" : "Share"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default TaskItem;
