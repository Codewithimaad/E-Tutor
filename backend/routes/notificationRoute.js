import express from 'express';
import { authUser } from '../middlewares/verifyToken.js';
import { clearAllNotifications, getTeacherNotifications, markAllAsRead } from '../controllers/notificationController.js';

const router = express.Router();


// Route to get notification for teacher
router.get('/teacher-notification', authUser, getTeacherNotifications); // GET /api/notifications/teacher

// Route to get all Notifications read
router.put('/mark-read', authUser, markAllAsRead);

// Route to clear all notifications
router.delete('/clear', authUser, clearAllNotifications); // 👈 New route


export default router;
