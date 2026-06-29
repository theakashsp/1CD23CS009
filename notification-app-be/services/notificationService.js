const axios = require('axios');
const priorityQueue = require('../utils/priorityQueue');

exports.getTopNotifications = async (req, res, next) => {
  try {
    const n = Number(req.query.n);
    const limit = Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
    const apiUrl = process.env.NOTIFICATION_API_URL || 'https://jsonplaceholder.typicode.com/todos';
    const response = await axios.get(apiUrl, { timeout: 5000 });
    const data = Array.isArray(response.data) ? response.data : response.data.notifications || [];
    const notifications = data.filter((item) => {
      if (!item) return false;
      if (typeof item.isRead === 'boolean') return !item.isRead;
      if (typeof item.read === 'boolean') return !item.read;
      if (typeof item.completed === 'boolean') return !item.completed;
      return true;
    }).map((item) => {
      const title = item.title || item.message || item.name || '';
      const type = item.type || item.notificationType || item.category || detectType(title);
      return {
        id: item.id,
        title,
        message: item.message || item.body || item.description || '',
        type,
        createdAt: item.createdAt || item.created_at || buildCreatedAt(item.id),
        isRead: false
      };
    });

    const topNotifications = priorityQueue.getTopNotifications(notifications, limit);

    res.status(200).json({
      success: true,
      count: topNotifications.length,
      notifications: topNotifications
    });
  } catch (error) {
    const statusCode = error.response ? error.response.status : 502;
    res.status(statusCode).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

function detectType(title) {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('placement')) return 'Placement';
  if (lowerTitle.includes('result')) return 'Result';
  return 'Event';
}

function buildCreatedAt(id) {
  const date = new Date();
  date.setMinutes(date.getMinutes() - id);
  return date.toISOString();
}
