const priorityMap = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function getPriority(notification) {
  const type = notification.type || '';
  return priorityMap[type] || 1;
}

function getTopNotifications(notifications, limit) {
  return notifications
    .map((item) => ({ ...item, priority: getPriority(item) }))
    .filter((item) => item.priority > 0)
    .sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, limit);
}

module.exports = {
  getTopNotifications
};
