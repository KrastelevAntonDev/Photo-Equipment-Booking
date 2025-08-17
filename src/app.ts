import express from 'express';
import { connectDB } from './config/database';
import userRoutes from './routes/userRoutes';
import roomRoutes from './routes/roomRoutes';
import equipmentRoutes from './routes/equipmentRoutes';
import bookingRoutes from './routes/bookingRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

connectDB();

app.use(express.json());

app.use('/api', userRoutes);
app.use('/api', roomRoutes);
app.use('/api', equipmentRoutes);
app.use('/api', bookingRoutes);
app.use('/api', authRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});