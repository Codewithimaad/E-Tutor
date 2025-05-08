import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import connectDB from './config/connectDb.js';
import userRoutes from './routes/userRoutes.js'
import enrollRoutes from './routes/enrollRoutes.js'
import notificationRoutes from './routes/notificationRoute.js'

// Initialize dotenv for environment variables
dotenv.config();

// App Config
const app = express();

// Db Connect
connectDB();

// CORS Middleware Configuration
const corsOptions = {
    origin: "*", // Allow all
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
    credentials: true, // Allow cookies if needed
};

// Middleware for JSON parsing
app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/enrollments', enrollRoutes);
app.use('/api/notification', notificationRoutes);


// Sample route to test API is working
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error handling middleware
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});


// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
