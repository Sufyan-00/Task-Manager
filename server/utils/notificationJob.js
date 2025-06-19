import cron from 'node-cron';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { transporter } from './mailer.js';

cron.schedule('*/1 * * * *', async () => { // every 10 minutes
  try{const now = new Date();
  const soon = new Date(now.getTime() + 60 * 60 * 1000); // next 1 hour
  const tasks = await Task.find({
    dueDate: { $gte: now, $lte: soon },
    notify: true,
    notified: { $ne: true },
    completed: false,
  }).populate('user');
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
      }}
      catch{
        console.error('Notification job error:', error);
      }
});