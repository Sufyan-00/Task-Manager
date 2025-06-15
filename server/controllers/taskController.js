import Task from '../models/Task.js';
import User from '../models/User.js';
import { Parser } from 'json2csv';
import PDFDocument from 'pdfkit';

export const getTasks = async (req, res) => {
  try {
    const { status, priority, tags, search } = req.query;
    const filter = {
      $or: [
        { createdBy: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    };

    // Apply status filter
    if (status === 'completed') filter.completed = true;
    if (status === 'pending') filter.completed = false;
    
    // Apply priority filter
    if (priority) filter.priority = priority;
    
    // Apply tags filter
    if (tags && tags.trim()) {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagArray.length > 0) {
        filter.tags = { $in: tagArray };
      }
    }

    // Apply search filter (FIX HERE)
    if (search && search.trim()) {
      // Create a copy of the base filter first to avoid modifying it directly
      const searchFilter = {
        $and: [
          // Copy the original filter structure
          {
            $or: [
              { createdBy: req.user._id },
              { 'sharedWith.user': req.user._id }
            ]
          },
          // Add search conditions
          {
            $or: [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
              // Remove the tags regex search as it might be causing issues
            ]
          }
        ]
      };

      // Apply any other filters to the searchFilter
      if (filter.completed !== undefined) {
        searchFilter.$and[0].completed = filter.completed;
      }
      if (filter.priority) {
        searchFilter.$and[0].priority = filter.priority;
      }
      if (filter.tags) {
        searchFilter.$and[0].tags = filter.tags;
      }

      // Use the search filter
      const tasks = await Task.find(searchFilter)
        .populate('createdBy', 'email name')
        .populate('sharedWith.user', 'email name')
        .sort({ order: 1, dueDate: 1, createdAt: -1 });
      
      return res.json(tasks);
    }

    // If no search, use the original filter
    const tasks = await Task.find(filter)
      .populate('createdBy', 'email name')
      .populate('sharedWith.user', 'email name')
      .sort({ order: 1, dueDate: 1, createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    console.error("Task search error:", error);
    res.status(500).json({ message: 'Server error' });
  }
};
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, tags, notify, subtasks } = req.body;
    if (!title?.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    const taskData = {
      createdBy: req.user._id,
      title: title.trim(),
      description: description?.trim() || '',
      dueDate: dueDate || null,
      priority: priority || 'medium',
      tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []),
      notify: Boolean(notify),
      notified: false,
      subtasks: subtasks || []
    };
    const task = await Task.create(taskData);
    await task.populate('createdBy', 'email name');
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, completed, tags, notify, subtasks } = req.body;
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { 
          'sharedWith.user': req.user._id,
          'sharedWith.permission': 'edit'
        }
      ]
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or no edit permission' });
    }
    if (title !== undefined) task.title = title.trim();
    if (description !== undefined) task.description = description?.trim() || '';
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority !== undefined) task.priority = priority;
    if (completed !== undefined) task.completed = completed;
    if (tags !== undefined) task.tags = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : []);
    if (notify !== undefined) {
      task.notify = Boolean(notify);
      if (notify) task.notified = false;
    }
    if (subtasks !== undefined) task.subtasks = subtasks;
    await task.save();
    await task.populate('createdBy', 'email name');
    await task.populate('sharedWith.user', 'email name');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or not authorized' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      $or: [
        { createdBy: req.user._id },
        { 
          'sharedWith.user': req.user._id,
          'sharedWith.permission': 'edit'
        }
      ]
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or no edit permission' });
    }
    task.completed = !task.completed;
    await task.save();
    await task.populate('createdBy', 'email name');
    await task.populate('sharedWith.user', 'email name');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSubtask = async (req, res) => {
  try {
    const { taskId, subtaskId } = req.params;
    const { completed } = req.body;
    const task = await Task.findOne({
      _id: taskId,
      $or: [
        { createdBy: req.user._id },
        { 
          'sharedWith.user': req.user._id,
          'sharedWith.permission': 'edit'
        }
      ]
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or no edit permission' });
    }
    const subtask = task.subtasks.id(subtaskId);
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }
    subtask.completed = Boolean(completed);
    await task.save();
    await task.populate('createdBy', 'email name');
    await task.populate('sharedWith.user', 'email name');
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const shareTask = async (req, res) => {
  try {
    const { userEmail, permission = 'view' } = req.body;
    const userToShareWith = await User.findOne({ email: userEmail });
    if (!userToShareWith) {
      return res.status(404).json({ message: 'User not found with this email' });
    }
    const task = await Task.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or you are not the owner' });
    }
    if (userToShareWith._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot share task with yourself' });
    }
    const alreadyShared = task.sharedWith.some(
      share => share.user.toString() === userToShareWith._id.toString()
    );
    if (alreadyShared) {
      return res.status(400).json({ message: 'Task already shared with this user' });
    }
    task.sharedWith.push({
      user: userToShareWith._id,
      permission,
      sharedAt: new Date()
    });
    await task.save();
    await task.populate('sharedWith.user', 'email name');
    res.json({ message: 'Task shared successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const unshareTask = async (req, res) => {
  try {
    const { userId } = req.body;
    const task = await Task.findOne({ 
      _id: req.params.id, 
      createdBy: req.user._id 
    });
    if (!task) {
      return res.status(404).json({ message: 'Task not found or you are not the owner' });
    }
    task.sharedWith = task.sharedWith.filter(
      share => share.user.toString() !== userId
    );
    await task.save();
    res.json({ message: 'Task unshared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const reorderTasks = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'orderedIds must be an array' });
    }
    await Promise.all(
      orderedIds.map((id, idx) =>
        Task.findOneAndUpdate({ _id: id, createdBy: req.user._id }, { order: idx })
      )
    );
    res.json({ message: 'Tasks reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const exportTasks = async (req, res) => {
  try {
    const { type } = req.query;
    const tasks = await Task.find({
      $or: [
        { createdBy: req.user._id },
        { 'sharedWith.user': req.user._id }
      ]
    }).lean();
    if (type === 'csv') {
      const fields = ['title', 'description', 'dueDate', 'priority', 'completed', 'tags', 'progress'];
      const parser = new Parser({ fields });
      const csv = parser.parse(tasks);
      res.header('Content-Type', 'text/csv');
      res.attachment('tasks.csv');
      return res.send(csv);
    } else if (type === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=tasks.pdf');
      doc.pipe(res);
      doc.fontSize(18).text('Tasks', { underline: true });
      doc.moveDown();
      tasks.forEach((task, idx) => {
        doc.fontSize(12).text(
          `${idx + 1}. ${task.title}\nDescription: ${task.description}\nDue: ${task.dueDate}\nPriority: ${task.priority}\nCompleted: ${task.completed}\nProgress: ${task.progress}%\nTags: ${(task.tags || []).join(', ')}`
        );
        doc.moveDown();
      });
      doc.end();
    } else {
      res.status(400).json({ message: 'Invalid export type' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};