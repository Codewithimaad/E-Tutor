import { useContext, useState, useEffect } from "react";
import { UserContext } from "../../context/userContextApi";
import axios from "axios";
import { toast } from 'react-toastify';

const Settings = () => {
    const { user, token, isGoogleUser, backendUrl } = useContext(UserContext);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [subject, setSubject] = useState("");
    const [experience, setExperience] = useState("");
    const [phone, setPhone] = useState("");
    const [image, setImage] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setEmail(user.email || "");
            setBio(user.bio || "");
            setSubject(user.subject || "");
            setExperience(user.experience || "");
            setPhone(user.phone || "");
            setImage(user.image || "");
        }
    }, [user]);

    const handleSaveDetails = async () => {
        setLoading(true);
        try {
            const updatedData = {
                firstName,
                lastName,
                email,
                bio,
                subject,
                experience,
                phone,
                image,
            };

            const response = await axios.put(
                `${backendUrl}api/users/update-teacher-profile`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data.success) {
                toast.success("Profile updated successfully!");
                console.log("Updated profile:", response.data);
            }

        } catch (err) {
            toast.error("Failed to update profile.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        setPasswordLoading(true);
        try {
            const response = await axios.put(
                `${backendUrl}api/users/change-password`,
                {
                    currentPassword,
                    newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            toast.success("Password changed successfully!");
            console.log("Password change response:", response.data);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            toast.error("Failed to change password.");
            console.error(err);
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 w-full">
            <div className="max-w-6xl mx-auto bg-white p-10 rounded-3xl shadow-xl">
                {/* Teacher Details */}
                <div className="mb-8 p-8 rounded-xl shadow-lg bg-white">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Teacher Details</h2>
                    <form className="space-y-6">
                        <div className="flex gap-6">
                            <div className="flex-1">
                                <label className="block text-gray-700 font-medium">First Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-xl"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    disabled={isGoogleUser}
                                    placeholder="Enter your first name"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 font-medium">Last Name</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-xl"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    disabled={isGoogleUser}
                                    placeholder="Enter your last name"
                                />
                            </div>
                        </div>

                        <div className="flex gap-6">
                            <div className="flex-1">
                                <label className="block text-gray-700 font-medium">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-3 border rounded-xl"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isGoogleUser}
                                    placeholder="Enter your email"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-gray-700 font-medium">Phone Number</label>
                                <input
                                    type="text"
                                    className="w-full p-3 border rounded-xl"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter your phone number"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium">Subject</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-xl"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Subject expertise"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium">Experience</label>
                            <input
                                type="text"
                                className="w-full p-3 border rounded-xl"
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                placeholder="Years of experience"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium">Bio</label>
                            <textarea
                                className="w-full p-3 border rounded-xl"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Write something about yourself"
                                rows="4"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-medium">Profile Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="mt-2"
                                disabled={isGoogleUser}
                            />
                            {image && (
                                <img
                                    src={image}
                                    alt="Profile Preview"
                                    className="mt-4 h-24 w-24 object-cover rounded-full border"
                                />
                            )}
                        </div>

                        <button
                            type="button"
                            className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-3 rounded-xl mt-4 disabled:opacity-50"
                            onClick={handleSaveDetails}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save Details"}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                {!isGoogleUser && (
                    <div className="p-8 rounded-xl shadow-lg mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Change Password</h2>
                        <form className="space-y-6">
                            <div>
                                <label className="block text-gray-700 font-medium">Current Password</label>
                                <input
                                    type="password"
                                    className="w-full p-3 border rounded-xl"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium">New Password</label>
                                <input
                                    type="password"
                                    className="w-full p-3 border rounded-xl"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full p-3 border rounded-xl"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-enter new password"
                                />
                            </div>

                            <button
                                type="button"
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg py-3 rounded-xl mt-4 disabled:opacity-50"
                                onClick={handleChangePassword}
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? "Changing..." : "Change Password"}
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Settings;
