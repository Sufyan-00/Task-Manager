import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  getTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  toggleTask,
  updateSubtask,
  shareTask,
  unshareTask,
  reorderTasks,
  exportTasks
} from '../controllers/taskController.js';

const router = express.Router();

// Remove debug middleware

router.use(protect);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.patch('/:id/toggle', toggleTask);
router.patch('/:taskId/subtasks/:subtaskId', updateSubtask);
router.post('/:id/share', shareTask);
router.post('/:id/unshare', unshareTask);
router.post('/reorder', reorderTasks);
router.get('/export', exportTasks);

export default router;