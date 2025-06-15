import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { transporter } from './mailer.js';

export const startNotificationJob = () => {
  // Run every day at 9 AM
  cron.schedule('0 9 * * *', async () => {
    try {
      // Find tasks due today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const tasks = await Task.find({
        dueDate: {
          $gte: today,
          $lt: tomorrow
        },
        status: { $ne: 'completed' }
      }).populate('user', 'email name');
      
      // Send notifications for each task
      for (const task of tasks) {
        if (!task.user || !task.user.email) continue;
        
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: task.user.email,
          subject: 'Task Due Today',
          html: `
            <h3>Hello ${task.user.name},</h3>
            <p>This is a reminder that your task "${task.title}" is due today.</p>
            <p>Task details:</p>
            <ul>
              <li>Description: ${task.description || 'No description'}</li>
              <li>Priority: ${task.priority}</li>
              <li>Status: ${task.status}</li>
            </ul>
            <p>Please complete this task as soon as possible.</p>
          `
        });
      }
    } catch (error) {
      // Log error but don't crash the application
      console.error('Notification job error:', error);
    }
  });
};