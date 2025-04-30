import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [studentCount, setStudentCount] = useState(0);


    // Backend URL (make sure to replace with the actual one)
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // Fetch user data using the token
    const fetchUserData = async () => {
        if (token) {
            try {
                const response = await axios.get(`${backendUrl}api/users/getUser`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("Fetched user data:", response.data.user); // Log the user data to check the googleImage field

                if (response.data.success) {
                    setUser(response.data.user);
                }
            } catch (err) {
                console.error(err);
                toast.error(response.data.message);
            }
        }
    };


    const fetchTotalStudents = async () => {
        if (!token) return; // ✅ Skip if not authenticated

        try {
            const response = await axios.get(`${backendUrl}api/users/total-students`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setStudentCount(response.data.total);
            console.log('total students: ', response.data.total);

        } catch (error) {
            console.error("Error fetching student count:", error);
        }
    };


    // Check for token and user data when the app is loaded
    useEffect(() => {
        if (token) {
            fetchUserData();
            fetchTotalStudents();
        }
    }, [token]);


    // Handle logout by clearing the token from localStorage and state
    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        toast.success('Logout Successfully!')
        navigate('/signin-page');
    };

    const value = {
        token,
        user,
        setToken,
        setUser,
        logout,
        studentCount,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContextProvider;
