import mongoose from "mongoose";
import Message from "../models/messageModel.js";

// Send a new message
const sendMessage = async (req, res) => {
    const { senderId, receiverId, text } = req.body;

    try {
        // Validate ObjectIds
        if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        const newMessage = new Message({ senderId, receiverId, text });
        await newMessage.save();

        // Populate sender/receiver details before sending response
        const populatedMessage = await Message.populate(newMessage, [
            { path: 'senderId', select: 'firstName lastName image' },
            { path: 'receiverId', select: 'firstName lastName image' }
        ]);

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ error: "Failed to send message", details: error.message });
    }
};

const getMessage = async (req, res) => {
    const { user1Id, user2Id } = req.params;

    // Enhanced validation
    if (!user1Id || !user2Id) {
        return res.status(400).json({
            error: "Both user IDs are required",
            example: "/api/messages/507f1f77bcf86cd799439011/507f191e810c19729de860ea"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(user1Id)) {
        return res.status(400).json({
            error: "First user ID is invalid",
            received: user1Id,
            expectedFormat: "24-character hexadecimal string (e.g. 507f1f77bcf86cd799439011)"
        });
    }

    if (!mongoose.Types.ObjectId.isValid(user2Id)) {
        return res.status(400).json({
            error: "Second user ID is invalid",
            received: user2Id,
            expectedFormat: "24-character hexadecimal string (e.g. 507f191e810c19729de860ea)"
        });
    }

    try {
        const messages = await Message.find({
            $or: [
                { senderId: user1Id, receiverId: user2Id },
                { senderId: user2Id, receiverId: user1Id },
            ],
        })
            .populate('senderId', 'firstName lastName image email')
            .populate('receiverId', 'firstName lastName image email')
            .sort({ timestamp: 1 });

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error in getMessage:", error);
        res.status(500).json({
            error: "Failed to fetch messages",
            details: error.message
        });
    }
};

// Get students who messaged a teacher
const studentWhoMessageTeacher = async (req, res) => {
    try {
        const { teacherId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(teacherId)) {
            return res.status(400).json({ message: 'Invalid teacherId' });
        }

        const conversations = await Message.find({ receiverId: teacherId })
            .populate('senderId', 'firstName lastName image email role')
            .exec();

        const uniqueSenders = {};
        conversations.forEach((msg) => {
            const sender = msg.senderId;
            if (sender && sender.role === 'student') {
                uniqueSenders[sender._id] = sender;
            }
        });

        res.json(Object.values(uniqueSenders));
    } catch (err) {
        console.error("Error in studentWhoMessageTeacher:", err);
        res.status(500).json({
            message: 'Error fetching conversations',
            error: err.message
        });
    }
};

export { sendMessage, getMessage, studentWhoMessageTeacher };