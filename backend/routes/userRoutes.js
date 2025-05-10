import express from 'express';
const router = express.Router();


import { signup, loginUser, getUserData, googleLogin, totalStudents, setUserRole, getTeachers, getTeacherDetails, updateTeacherProfile, getStudents, setZoomLink, getZoomLinkIfEnrolled, } from '../controllers/userController.js';
import { updateProfile, changePassword } from '../controllers/profleController.js'; // You may separate these for clarity
import { authUser } from '../middlewares/verifyToken.js';

// 🔐 Auth & Registration
router.post('/signup', signup);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);

// 🧑‍💼 Authenticated User Info
router.get('/getUser', authUser, getUserData);

// ⚙️ Profile Management
router.put('/update-profile', authUser, updateProfile); // New controller to be added
router.put('/change-password', authUser, changePassword); // New controller to be added

// Get total students
router.get('/total-students', authUser, totalStudents);

// ✅ Set Role (first-time only)
router.post('/set-role', authUser, setUserRole); // <-- Add this

// GET all teachers
router.get("/get-teachers", authUser, getTeachers); // Handles /api/users?role=teacher

// GET all students
router.get("/get-students", authUser, getStudents); // Handles /api/users?role=student

// GET teacher details
router.get("/get-teacher/:id", authUser, getTeacherDetails);

// Update Teacher Profile
router.put('/update-teacher-profile', authUser, updateTeacherProfile); // ✅ Updated

router.post("/:id/zoom-link", authUser, setZoomLink);


router.get("/:teacherId/zoom-link-for-student/:studentId", authUser, getZoomLinkIfEnrolled);



export default router;
