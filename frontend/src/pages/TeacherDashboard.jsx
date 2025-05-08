import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { UserContext } from "../context/userContextApi";

import MyStudents from "../components/Teacher Dashboard/MyStudents";
import CreateCourse from "../components/Teacher Dashboard/CreateCourse";
import Message from "../components/Teacher Dashboard/Message";
import Overview from "../components/Teacher Dashboard/Overview";
import Settings from "../components/Teacher Dashboard/Settings";
import Profile from "../components/Teacher Dashboard/Profile";
import Notification from "../components/Teacher Dashboard/Notification"; // ✅ Rename for clarity
import EnrollmentRequests from "../components/Teacher Dashboard/EnrollmentRequest";

const TeacherDashboard = () => {
    const [activeComponent, setActiveComponent] = useState("Overview");
    const { token, user, loading } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!loading) {
                if (!token || !user) {
                    toast.error("You need to log in to access the dashboard.");
                    navigate("/dashboard");
                } else if (!user.role) {
                    toast.error("Please select your role first.");
                    navigate("/dashboard");
                } else if (user.role !== "teacher") {
                    toast.error("Access denied. You're not a teacher.");
                    navigate("/dashboard");
                }
            }
        }, 100);

        return () => clearTimeout(timeout);
    }, [loading, token, user, navigate]);

    if (loading) {
        return <div className="text-center py-10 text-gray-500">Loading dashboard...</div>;
    }

    if (!token || !user || user.role !== "teacher") return null;

    const renderComponent = () => {
        switch (activeComponent) {
            case "Overview":
                return <Overview />;
            case "MyStudents":
                return <MyStudents />;
            case "CreateCourse":
                return <CreateCourse />;
            case "Message":
                return <Message />;
            case "Settings":
                return <Settings />;
            case "Profile":
                return <Profile teacherId={user._id} />;
            case "EnrollmentRequests":
                return <EnrollmentRequests />;
            default:
                return <Overview />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="bg-white shadow-md rounded-xl p-6 flex justify-between items-center">
                <div>
                    <img className="w-20 h-20 object-cover rounded-full" src={user.image || "/default-user.png"} alt="User Avatar" />
                    <h1 className="text-xl font-bold mt-2">{user.firstName} {user.lastName}</h1>
                    <p className="text-gray-600">{user.bio || "No bio added yet."}</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm text-gray-500">
                            Role: <span className="text-black font-semibold capitalize">{user.role}</span>
                        </p>
                    </div>

                    {/* ✅ Notifications bell icon */}
                    <Notification />
                </div>
            </div>

            <div className="bg-white shadow-md rounded-xl mt-4 p-4 flex gap-6 flex-wrap">
                {["Overview", "MyStudents", "CreateCourse", "Message", "Settings", "Profile", "EnrollmentRequests"].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveComponent(tab)}
                        className={`pb-1 font-semibold ${activeComponent === tab ? "border-b-2 border-black" : "text-gray-500"}`}
                    >
                        {tab.replace(/([A-Z])/g, " $1").trim()}
                    </button>
                ))}
            </div>

            <div className="mt-6">
                {renderComponent()}
            </div>
        </div>
    );
};

export default TeacherDashboard;
