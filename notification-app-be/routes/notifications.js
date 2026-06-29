const express = require('express');
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.get('/top', notificationController.getTopNotifications);

module.exports = router;
