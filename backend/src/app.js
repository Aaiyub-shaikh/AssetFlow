import express from 'express';
import cors from 'cors';

import auditRoutes from './routes/audits.js';
import bookingRoutes from './routes/bookings.js';
import resourceRoutes from './routes/resources.js';
import reportRoutes from './routes/report.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import activityRoutes from './routes/activity.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 AssetFlow Backend Running',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is healthy',
  });
});

app.use('/api/audits', auditRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity', activityRoutes);

export default app;