import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/studentUserModel.js';
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
            user,
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
        console.log(total);

        res.json({ total });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get student count' });
    }
};


export { signup, loginUser, getUserData, googleLogin, totalStudents };
