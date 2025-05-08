import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';

const getTeacherNotifications = async (req, res) => {
    try {
        const userId = req.user.id;



        const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, notifications });
    } catch (err) {
        console.error('Error fetching notifications:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user.id, read: false }, { read: true });
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        console.error('Error marking notifications:', err);
        res.status(500).json({ success: false, message: 'Failed to mark notifications as read' });
    }
};

const clearAllNotifications = async (req, res) => {
    try {
        const userId = req.user.id;



        await Notification.deleteMany({ recipient: userId });

        res.status(200).json({ success: true, message: 'All notifications cleared' });
    } catch (err) {
        console.error('Error clearing notifications:', err);
        res.status(500).json({ success: false, message: 'Failed to clear notifications' });
    }
};

export { markAllAsRead, getTeacherNotifications, clearAllNotifications };
