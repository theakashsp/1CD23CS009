const express = require('express');
const notificationsRouter = require('./routes/notifications');
const errorHandler = require('./middleware/errorHandler');

const app = express();

app.use(express.json());
app.use('/api/v1/notifications', notificationsRouter);
app.use(errorHandler);

module.exports = app;
