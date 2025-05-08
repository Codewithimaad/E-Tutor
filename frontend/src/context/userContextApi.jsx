import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null);
    const [studentCount, setStudentCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const fetchUserData = async () => {
        setLoading(true);
        if (token) {
            try {
                const response = await axios.get(`${backendUrl}api/users/getUser`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.data.success) {
                    setUser(response.data.user);
                } else {
                    toast.error(response.data.message);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to fetch user data.");
            }
        }
        setLoading(false);
    };

    const fetchTotalStudents = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${backendUrl}api/users/total-students`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStudentCount(response.data.total);
        } catch (error) {
            console.error("Error fetching student count:", error);
        }
    };


    const fetchNotifications = async () => {
        if (!token || !user || user.role !== 'teacher') return;
        try {
            const res = await axios.get(`${backendUrl}api/notification/teacher-notification`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data.notifications || []);
        } catch (err) {
            console.error('Error fetching notifications:', err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUserData();
            fetchTotalStudents();
        } else {
            setLoading(false);
        }
    }, [token]);

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.success('Logged out successfully!');
        navigate('/signin-page');
    };

    return (
        <UserContext.Provider
            value={{
                token,
                user,
                userId: user?._id, // ✅ added here
                setToken,
                setUser,
                logout,
                studentCount,
                loading,
                backendUrl,
                isGoogleUser: user?.isGoogleUser || false,
                notifications,
                setNotifications,
                fetchNotifications,
            }}
        >
            {children}
        </UserContext.Provider>
    );
};

export default UserContextProvider;
