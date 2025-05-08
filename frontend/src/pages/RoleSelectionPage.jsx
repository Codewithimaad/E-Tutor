import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import rightImg from '../assets/signup-page/Saly-1.png';
import { UserContext } from "../context/userContextApi";

const RoleSelectionPage = () => {
    const [role, setRole] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, token, setUser, setToken } = useContext(UserContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setRole(e.target.value);
    };

    const handleSubmit = async () => {
        if (!role) {
            toast.warning("Please select a role before continuing.");
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const response = await axios.post(
                'http://localhost:5000/api/users/set-role',
                { role },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                setUser(response.data.user);
                setToken(response.data.token);

                toast.success("Role selected successfully!");

                if (response.data.user.role === 'teacher') {
                    navigate('/teacher-dashboard');
                } else {
                    navigate('/dashboard-page');
                }
            }

        } catch (error) {
            console.error("Role selection failed:", error);
            toast.error(
                error.response?.data?.message || "Failed to set role. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!token && !user) {
                toast.error("You need to log in to access the dashboard.");
                navigate("/signin-page");
            } else if (user && user.role) {
                toast.error("Role already selected.");
                if (user.role === 'teacher') {
                    navigate('/teacher-dashboard');
                } else {
                    navigate('/dashboard-page');
                }
            }
        }, 50);

        return () => clearTimeout(timeout);
    }, [token, user, navigate]);

    return (
        <div className="min-h-screen flex">
            {/* Left Image Section */}
            <div className="flex-1 flex items-center justify-center bg-indigo-50 relative">
                <img
                    src={rightImg}
                    alt="Illustration"
                    className="w-[80%] h-auto"
                />
            </div>

            {/* Right Dropdown Section */}
            <div className="flex-1 flex flex-col justify-center items-center bg-white p-12">
                <div className="max-w-md w-full">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
                        Choose Your Role
                    </h1>

                    <select
                        value={role}
                        onChange={handleChange}
                        className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 text-gray-700"
                    >
                        <option value="" disabled>
                            Want to become a teacher or student?
                        </option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                    </select>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`mt-5 py-3 px-12 rounded-md text-white transition duration-200 ease-in-out 
                            ${loading ? "bg-orange-300 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}
                        `}
                    >
                        {loading ? "Submitting..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
