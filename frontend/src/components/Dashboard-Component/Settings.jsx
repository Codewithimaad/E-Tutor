import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../../context/userContextApi";
import axios from "axios";
import { toast } from 'react-toastify'

const Settings = () => {
  const { user: contextUser, token } = useContext(UserContext);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    title: "",
    bio: "",
    image: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  // ✅ Load user data into form
  useEffect(() => {
    if (contextUser) {
      setFormData((prev) => ({
        ...prev,
        firstName: contextUser.firstName || "",
        lastName: contextUser.lastName || "",
        username: contextUser.username || "",
        email: contextUser.email || "",
        title: contextUser.title || "",
        bio: contextUser.bio || "",
        image: contextUser.image || "",
      }));

      setPreviewImage(
        contextUser.image || contextUser.image || null
      );
      setIsGoogleUser(contextUser.isGoogleUser || false);
    }
  }, [contextUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Profile updated successfully!");
      console.log("Updated profile:", response.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile.");
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.put(
        "http://localhost:5000/api/users/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Password changed successfully!");
      console.log("Password change response:", response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to change password.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-6">Account Settings</h2>

      <div className="flex items-center gap-6">
        <label className={`cursor-pointer ${isGoogleUser ? "opacity-50 pointer-events-none" : ""}`}>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            disabled={isGoogleUser}
          />
          <div className="w-24 h-24 border rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
            {previewImage ? (
              <img
                src={previewImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              "Upload"
            )}
          </div>
        </label>
        <p className="text-sm text-gray-500">
          Image should be under 1MB and 1:1 ratio
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <input
          type="text"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="First name"
          className="p-2 border rounded-md text-gray-500"
          disabled={isGoogleUser}
        />
        <input
          type="text"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Last name"
          className="p-2 border rounded-md text-gray-500"
          disabled={isGoogleUser}
        />
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Username"
          className="col-span-2 p-2 border rounded-md text-gray-500"
          disabled={isGoogleUser}
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Email address"
          className="col-span-2 p-2 border rounded-md text-gray-500"
          disabled={isGoogleUser}
        />
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Your title, profession or biography"
          className="col-span-2 p-2 border rounded-md text-gray-500"
        />
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Short bio or about you"
          className="col-span-2 p-2 border rounded-md resize-none text-gray-500"
          rows={4}
        />
      </div>

      <button
        onClick={handleSaveChanges}
        className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg"
      >
        Save Changes
      </button>

      {!isGoogleUser && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-4">Change Password</h2>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Current Password"
              className="col-span-2 p-2 border rounded-md"
            />
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="New Password"
              className="col-span-2 p-2 border rounded-md"
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="col-span-2 p-2 border rounded-md"
            />
          </div>

          <button
            onClick={handleChangePassword}
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg"
          >
            Change Password
          </button>
        </>
      )}
    </div>
  );
};

export default Settings;
