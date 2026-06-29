exports.getNotifications = (req, res, next) => {
  res.status(200).json({ notifications: [] });
};

exports.getNotificationById = (req, res, next) => {
  res.status(200).json({ notification: null });
};

exports.createNotification = (req, res, next) => {
  res.status(201).json({ message: 'Notification created' });
};

exports.markNotificationAsRead = (req, res, next) => {
  res.status(200).json({ message: 'Notification marked as read' });
};

exports.markAllNotificationsAsRead = (req, res, next) => {
  res.status(200).json({ message: 'All notifications marked as read' });
};

exports.deleteNotification = (req, res, next) => {
  res.status(200).json({ message: 'Notification deleted' });
};
