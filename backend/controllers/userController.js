import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { OAuth2Client } from 'google-auth-library';


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ✅ Google login
const googleLogin = async (req, res) => {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ success: false, message: 'Google credential is required.' });
    }

    try {
        // Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        const { email, given_name, family_name, picture } = payload;

        let user = await User.findOne({ email });

        // If user doesn't exist, create new one
        if (!user) {
            let baseUsername = email.split('@')[0];
            let username = baseUsername;
            let suffix = 1;
            while (await User.findOne({ username })) {
                username = `${baseUsername}${suffix++}`;
            }

            user = new User({
                email,
                firstName: given_name,
                lastName: family_name,
                username,
                image: picture || '/default-avatar.png', // Use Google image or default avatar
                isGoogleUser: true,
                password: undefined, // Avoid saving password for Google login
            });

            await user.save();
        } else {
            // Update user with the Google image
            user.image = picture || user.image;  // Keep existing custom image if Google image is not provided
            await user.save();
        }

        // Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Return user data and token
        return res.status(200).json({
            success: true,
            message: 'Google login successful!',
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                image: user.image,  // Return the combined image field
                role: user.role || '',  // Add role to response
            },
        });

    } catch (error) {
        console.error('Google login error:', error);
        return res.status(401).json({ success: false, message: 'Google login failed.', error: error.message });
    }
};





// ✅ User registration
const signup = async (req, res) => {
    const { firstName, lastName, username, email, password, confirmPassword, title, profileImage } = req.body;

    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists with that email.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            firstName,
            lastName,
            username,
            email,
            title,
            profileImage,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: 'User created successfully!',
            user: {
                id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                title: newUser.title,
                profileImage: newUser.profileImage,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error registering user', error: error.message });
    }
};

// ✅ Login with email/password
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                image: user.image,
                role: user.role || '',  // Add role to response
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
    }
};


// ✅ Get user by token
const getUserData = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(400).json({ success: false, message: 'Token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

const totalStudents = async (req, res) => {
    try {
        const total = await User.countDocuments({}); // Or add role: 'student' if applicable

        res.json({ total });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get student count' });
    }
};

// ✅ Set user role (only if not already set)
const setUserRole = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    const { role } = req.body;

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization token required.' });
    }

    if (!role) {
        return res.status(400).json({ success: false, message: 'Role is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        if (user.role) {
            return res.status(400).json({ success: false, message: 'Role already set. Cannot update again.' });
        }

        user.role = role;
        await user.save();

        // Generate a new token after role is set
        const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            success: true,
            message: 'Role set successfully.',
            token: newToken, // Send the updated token to the client
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Error setting role:', error);
        res.status(500).json({ success: false, message: 'Failed to set role.', error: error.message });
    }
};


// GET /api/users?role=teacher
const getTeachers = async (req, res) => {
    try {
        const teachers = await User.find({ role: "teacher" }).select("-password"); // exclude password
        res.status(200).json(teachers);
    } catch (error) {
        console.error("Error fetching teachers:", error);
        res.status(500).json({ message: "Server error. Could not fetch teachers." });
    }
};


const getTeacherDetails = async (req, res) => {
    try {
        const teacher = await User.findById(req.params.id).select("-password");
        console.log(teacher);

        if (!teacher || teacher.role !== "teacher") {
            return res.status(404).json({ message: "Teacher not found" });
        }
        res.status(200).json(teacher);
    } catch (error) {
        console.error("Error fetching teacher:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ Update teacher profile
const updateTeacherProfile = async (req, res) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ success: false, message: 'Authorization token is required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Prevent email/username change for Google users
        if (user.isGoogleUser) {
            req.body.email = user.email;
            req.body.firstName = user.firstName;
            req.body.lastName = user.lastName;
        }

        const { firstName, lastName, email, phone, bio, subject, experience, image } = req.body;

        // Update fields
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.bio = bio || user.bio;
        user.subject = subject || user.subject;
        user.experience = experience || user.experience;
        user.image = image || user.image;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                bio: user.bio,
                subject: user.subject,
                experience: user.experience,
                image: user.image,
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ success: false, message: 'Failed to update profile.', error: error.message });
    }
};




export { signup, loginUser, getUserData, googleLogin, totalStudents, setUserRole, getTeachers, getTeacherDetails, updateTeacherProfile };
