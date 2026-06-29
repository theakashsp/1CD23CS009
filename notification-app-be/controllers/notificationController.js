const notificationService = require('../services/notificationService');

exports.getTopNotifications = (req, res, next) => {
  notificationService.getTopNotifications(req, res, next);
};
