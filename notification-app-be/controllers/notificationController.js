const notificationService = require('../services/notificationService');

exports.getNotifications = (req, res, next) => {
  notificationService.getNotifications(req, res, next);
};

exports.getNotificationById = (req, res, next) => {
  notificationService.getNotificationById(req, res, next);
};

exports.createNotification = (req, res, next) => {
  notificationService.createNotification(req, res, next);
};

exports.markNotificationAsRead = (req, res, next) => {
  notificationService.markNotificationAsRead(req, res, next);
};

exports.markAllNotificationsAsRead = (req, res, next) => {
  notificationService.markAllNotificationsAsRead(req, res, next);
};

exports.deleteNotification = (req, res, next) => {
  notificationService.deleteNotification(req, res, next);
};
