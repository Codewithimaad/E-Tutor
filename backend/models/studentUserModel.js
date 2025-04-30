import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: false },
        image: { type: String, default: "" },  // Combined image field (either custom or Google)
        bio: { type: String, default: "" },    // User bio/about
        title: { type: String, required: false },
        isGoogleUser: { type: Boolean, default: false },  // Google login flag
    },
    { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
