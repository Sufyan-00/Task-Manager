import cron from 'node-cron';
import Task from '../models/Task.js';
import {transporter} from './mailer.js'; // adjust path as needed

cron.schedule('*/1 * * * *', async () => {
  const now = new Date();
  const soon = new Date(now.getTime() + 60 * 60 * 1000); // next 1 hour
  const tasks = await Task.find({
    dueDate: { $gte: now, $lte: soon },
    notify: true,
    notified: { $ne: true },
    completed: false,
  }).populate('createdBy');

  for (const task of tasks) {
    if (!task.createdBy?.email) continue;

    // Format due date for user's local time (optional: adjust as needed)
    const dueDateStr = new Date(task.dueDate).toLocaleString('en-US', {
      dateStyle: 'full',
      timeStyle: 'short'
    });

    // Beautiful HTML email
    const html = `
      <div style="font-family: Arial, sans-serif; background: #f9f9f9; padding: 32px;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
          <h2 style="color: #2d7ff9; margin-top: 0;">⏰ Task Due Soon!</h2>
          <p style="font-size: 1.1em; color: #333;">
            Hello <b>${task.createdBy.name || 'there'}</b>,
          </p>
          <p style="font-size: 1.1em; color: #333;">
            Your task <b style="color: #2d7ff9;">"${task.title}"</b> is due on:
          </p>
          <div style="background: #f1f7ff; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 1.15em;">
            <b>${dueDateStr}</b>
          </div>
          ${task.description ? `<p style="color: #555;">${task.description}</p>` : ''}
          <a href="${process.env.CLIENT_URL || '#'}" style="display: inline-block; margin-top: 24px; background: #2d7ff9; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: bold;">
            View Task
          </a>
          <p style="margin-top: 32px; color: #aaa; font-size: 0.95em;">
            — Task Manager Team
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: task.createdBy.email,
      subject: `⏰ Task Due Soon: ${task.title}`,
      html,
      // text fallback (optional)
      text: `Your task "${task.title}" is due on ${dueDateStr}.`
    });

    // Mark as notified (optional)
    task.notified = true;
    await task.save();
  }
});