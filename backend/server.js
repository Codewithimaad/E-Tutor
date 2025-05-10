// server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import connectDB from './config/connectDb.js';
import userRoutes from './routes/userRoutes.js';
import enrollRoutes from './routes/enrollRoutes.js';
import notificationRoutes from './routes/notificationRoute.js';
import messageRoutes from './routes/messageRoutes.js';
import { setupSocket } from './utils/socket.js'; // 👈 Import socket setup

dotenv.config();

const app = express();
const server = http.createServer(app);

connectDB();

const corsOptions = {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/enrollments', enrollRoutes);
app.use('/api/notification', notificationRoutes);
app.use('/api/messages', messageRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// 🔌 Initialize Socket.IO
setupSocket(server);

app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 Server running with Socket.IO on http://localhost:${PORT}`);
});
