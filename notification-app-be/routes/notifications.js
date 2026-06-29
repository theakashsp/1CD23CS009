const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/', notificationController.getNotifications);
router.get('/:id', notificationController.getNotificationById);
router.post('/', notificationController.createNotification);
router.patch('/:id/read', notificationController.markNotificationAsRead);
router.patch('/read-all', notificationController.markAllNotificationsAsRead);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;
