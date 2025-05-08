import express from 'express';
import { authUser } from '../middlewares/verifyToken.js';
import { enrollStudent, getEnrolledStudents, getPendingRequests, handleEnrollmentStatus, updateEnrollmentById } from '../controllers/enrollController.js';

const router = express.Router();

// Route to handle student enrollment
router.post('/enroll', authUser, enrollStudent);

// Route to handle status updates for enrollments (approve/reject)
router.post('/enrollment/status', authUser, handleEnrollmentStatus);

// Route to get enrolled students for a specific teacher
router.get('/myStudents', authUser, getEnrolledStudents);

// Route to get pending request
router.get('/requests', authUser, getPendingRequests);

// ROute to update the request
router.put('/requests/:id', authUser, updateEnrollmentById);

export default router;
