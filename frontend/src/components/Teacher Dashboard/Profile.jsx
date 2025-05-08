import React, { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../context/userContextApi";

const Profile = () => {
    const { backendUrl, user } = useContext(UserContext);
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${backendUrl}api/users/get-teacher/${user._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setTeacher(res.data);
            } catch (error) {
                console.error("Failed to load teacher profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTeacher();
        } else {
            setLoading(false);
        }
    }, [backendUrl, user]);

    if (loading) return <p className="text-center mt-10 text-lg font-medium">Loading...</p>;
    if (!teacher) return <p className="text-center mt-10 text-red-600 text-lg">Teacher not found.</p>;

    // Dummy courses if teacher has none
    const fallbackCourses = [
        { _id: "1", title: "Intro to JavaScript", description: "Learn JavaScript basics including variables, loops, and DOM." },
        { _id: "2", title: "React Fundamentals", description: "Understand components, hooks, and building interactive UIs." },
        { _id: "3", title: "Backend with Node.js", description: "Build robust APIs using Express and MongoDB." }
    ];

    const courseList = teacher.courses?.length > 0 ? teacher.courses : fallbackCourses;

    return (
        <div className="min-h-screen w-full bg-gray-100 pt-14 pb-20">
            <div className="w-full mx-auto bg-white p-2 lg:p-10 rounded-2xl shadow-2xl">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-10 border-b pb-10">
                    <img
                        src={teacher.image}
                        alt={`${teacher.firstName} ${teacher.lastName}`}
                        className="w-44 h-44 rounded-full object-cover border-4 border-orange-500 shadow-md"
                    />
                    <div className="text-center md:text-left space-y-3">
                        <h1 className="text-4xl font-bold text-gray-800">
                            {teacher.firstName} {teacher.lastName}
                        </h1>
                        <p className="text-gray-600 text-lg">{teacher.bio || "No bio available."}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
                            <span className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700">
                                🎓 Role: <strong>{teacher.role}</strong>
                            </span>
                            <span className="bg-yellow-100 px-4 py-2 rounded-lg text-yellow-800">
                                ⭐ Rating: {teacher.rating || "4.5"}
                            </span>
                            <span className="bg-blue-100 px-4 py-2 rounded-lg text-blue-700">
                                📧 {teacher.email}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Courses Section */}
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                        My Courses
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courseList.map((course) => (
                            <div
                                key={course._id}
                                className="bg-orange-50 hover:bg-orange-100 transition rounded-xl p-5 shadow-md"
                            >
                                <h3 className="text-lg font-semibold text-orange-700">{course.title}</h3>
                                <p className="text-sm text-gray-600 mt-2">
                                    {course.description?.substring(0, 100) || "No description provided."}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
