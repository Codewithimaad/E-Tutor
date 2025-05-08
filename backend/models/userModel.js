import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false }, // Password is optional, since Google users may not have it
        image: { type: String, default: "" },
        bio: { type: String, default: "" },
        title: { type: String, required: false },  // Optional field for teacher's title
        subject: { type: String, default: "" },  // New field for the subject the teacher teaches
        experience: { type: String, default: "" },  // New field for years of experience
        phone: { type: String, default: "" },  // New field for phone number
        role: {
            type: String,
            enum: ['student', 'teacher'],
        },
        isGoogleUser: { type: Boolean, default: false },  // Flag for Google users
        students: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',  // Reference to the User schema for students
            }
        ],  // Array to store enrolled students
        notifications: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Notification',
            }
        ]
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
