import React, { useContext, useEffect, useState } from "react";
import { UserIcon } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { UserContext } from "../../context/userContextApi";

const MyStudents = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { backendUrl } = useContext(UserContext);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) {
                    toast.error("You must be logged in to view enrolled students.");
                    return;
                }

                const response = await axios.get(`${backendUrl}api/enrollments/myStudents`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setStudents(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching students:", error);
                setError("Failed to fetch enrolled students. Please try again later.");
                setLoading(false);
                toast.error("Failed to load student data");
            }
        };

        fetchStudents();
    }, [backendUrl]);

    return (
        <div className="w-full mx-auto bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800">My Students</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {loading ? "Loading..." : `${students.length} enrolled student${students.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                {students.length > 0 && (
                    <div className="mt-3 sm:mt-0">
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="px-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                )}
            </div>

            {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[...Array(6)].map((_, index) => (
                        <div key={index} className="animate-pulse bg-gray-50 rounded-lg p-5 h-28"></div>
                    ))}
                </div>
            ) : error ? (
                <div className="bg-red-50 border border-red-100 rounded-lg p-6 text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-3 px-4 py-2 text-sm bg-white border border-red-200 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            ) : students.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {students.map((student) => (
                        <div
                            key={student._id}
                            className="bg-white border border-gray-100 rounded-lg p-5 hover:shadow-md transition-all"
                        >
                            <div className="flex items-start space-x-4">
                                <div className="bg-blue-50 p-3 rounded-full flex-shrink-0">
                                    <UserIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium text-gray-800 truncate">{student.name}</h3>
                                    <p className="text-sm text-gray-500 truncate mt-1">{student.email}</p>
                                    <div className="mt-3 flex justify-between items-center">
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                            Student
                                        </span>
                                        <button
                                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                            aria-label={`View ${student.name}'s profile`}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No students enrolled</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        Students who enroll with you will appear here. Share your profile to get more students.
                    </p>
                </div>
            )}
        </div>
    );
};

export default MyStudents;