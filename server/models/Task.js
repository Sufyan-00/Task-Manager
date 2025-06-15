import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true
  },
  title: { type: String, required: [true, 'Title required'] },
  description: { type: String, default: '' },
  dueDate: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  completed: { type: Boolean, default: false },
  tags: [{ type: String }],
  order: { type: Number, default: 0 },
  notify: { type: Boolean, default: false },
  notified: { type: Boolean, default: false },
  subtasks: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  progress: { type: Number, default: 0, min: 0, max: 100 },
  sharedWith: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    permission: { type: String, enum: ['view', 'edit'], default: 'view' },
    sharedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

taskSchema.pre('save', function() {
  if (this.subtasks && this.subtasks.length > 0) {
    const completed = this.subtasks.filter(sub => sub.completed).length;
    this.progress = Math.round((completed / this.subtasks.length) * 100);
  } else {
    this.progress = this.completed ? 100 : 0;
  }
});

export default mongoose.model('Task', taskSchema);