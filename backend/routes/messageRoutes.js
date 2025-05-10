import express from "express";
import {
    getMessage,
    sendMessage,
    studentWhoMessageTeacher
} from "../controllers/messageController.js";
import { authUser } from "../middlewares/verifyToken.js"

const router = express.Router();

// Send a new message
router.post("/", authUser, sendMessage);

// Get messages between two users
router.get("/:user1Id/:user2Id", authUser, getMessage);

// Get students who messaged a teacher
router.get('/conversations/:teacherId', authUser, studentWhoMessageTeacher);

export default router;