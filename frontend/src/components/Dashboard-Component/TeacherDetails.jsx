import React, { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/userContextApi";
import defaultAvatar from "../assets/Teachers-images/t-1.png";
import { toast } from "react-toastify";

const TeacherProfile = () => {
    const { id } = useParams();
    const { backendUrl, userId } = useContext(UserContext);
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [review, setReview] = useState({ rating: 5, content: "" });

    const [zoomLink, setZoomLink] = useState(null);
    const [zoomError, setZoomError] = useState("");

    // Fetch teacher profile
    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${backendUrl}api/users/get-teacher/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTeacher(res.data);
                setReviews(res.data.reviews || []);
            } catch (error) {
                console.error("Failed to load teacher profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeacher();
    }, [backendUrl, id]);

    // Fetch Zoom link if student is enrolled
    useEffect(() => {
        const fetchZoomLink = async () => {
            if (!teacher?._id || !userId) return;
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(
                    `${backendUrl}api/users/${teacher._id}/zoom-link-for-student/${userId}`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );

                console.log(res.data);

                setZoomLink(res.data.zoomLink);
            } catch (error) {
                setZoomError("Zoom link is unavailable or you are not enrolled.");
            }
        };

        fetchZoomLink();
    }, [teacher, userId]);

    const handleReviewChange = (e) => {
        const { name, value } = e.target;
        setReview((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post(
                `${backendUrl}api/reviews/create`,
                { teacherId: id, ...review },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setReviews([res.data, ...reviews]);
            setReview({ rating: 5, content: "" });
        } catch (error) {
            console.error("Failed to submit review:", error);
        }
    };

    const enrollStudent = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${backendUrl}api/enrollments/enroll`,
                { studentId: userId, teacherId: teacher._id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.data.message) {
                toast.success(response.data.message);
            } else {
                toast.error("No message in response.");
            }
        } catch (error) {
            console.error("Error enrolling student:", error);
            toast.error("Something went wrong. Please try again.");
        }
    };

    if (loading) return <p className="text-center mt-10 text-lg font-medium">Loading...</p>;
    if (!teacher) return <p className="text-center mt-10 text-red-600 text-lg">Teacher not found.</p>;

    const fallbackCourses = [
        { _id: "1", title: "Intro to JavaScript", description: "Learn JavaScript basics including variables, loops, and DOM." },
        { _id: "2", title: "React Fundamentals", description: "Understand components, hooks, and building interactive UIs." },
        { _id: "3", title: "Backend with Node.js", description: "Build robust APIs using Express and MongoDB." }
    ];

    const courseList = teacher.courses?.length > 0 ? teacher.courses : fallbackCourses;

    return (
        <div className="min-h-screen w-full bg-gray-100 pt-14 pb-20 px-2 lg:px-6">
            <div className="w-full mx-auto bg-white p-4 lg:p-10 rounded-2xl shadow-lg">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-10 border-b pb-10">
                    <img
                        src={teacher.image || defaultAvatar}
                        alt={`${teacher.firstName} ${teacher.lastName}`}
                        className="w-44 h-44 rounded-full object-cover border-4 border-orange-500 shadow-md"
                    />
                    <div className="text-center md:text-left space-y-3">
                        <h1 className="text-4xl font-bold text-gray-800">{teacher.firstName} {teacher.lastName}</h1>
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

                {/* Courses */}
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                        Courses by {teacher.firstName}
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

                {/* CTA */}
                <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
                    <button className="bg-orange-500 hover:bg-orange-600 transition text-white text-lg px-8 py-3 rounded-xl shadow-md">
                        Message {teacher.firstName}
                    </button>
                    <Link
                        onClick={enrollStudent}
                        className="bg-white border border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white transition text-lg px-8 py-3 rounded-xl shadow-md text-center"
                    >
                        Enroll with {teacher.firstName}
                    </Link>
                </div>

                {/* Zoom Section */}
                <div className="mt-10 bg-white border-t pt-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Zoom Call</h2>
                    {zoomLink ? (
                        <a
                            href={zoomLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline"
                        >
                            Join Zoom Meeting
                        </a>
                    ) : (
                        <p className="text-red-500">{zoomError}</p>
                    )}
                </div>

                {/* Reviews */}
                <div className="mt-12">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
                        Reviews for {teacher.firstName}
                    </h2>
                    <div className="space-y-6">
                        {/* Review Form */}
                        <form onSubmit={handleReviewSubmit} className="bg-gray-100 p-6 rounded-xl shadow-md">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4">Leave a Review</h3>
                            <div className="flex items-center mb-4">
                                <label className="mr-4">Rating:</label>
                                <select
                                    name="rating"
                                    value={review.rating}
                                    onChange={handleReviewChange}
                                    className="border border-gray-300 rounded-md p-2"
                                >
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <option key={star} value={star}>
                                            {star} Stars
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="mb-4">
                                <textarea
                                    name="content"
                                    value={review.content}
                                    onChange={handleReviewChange}
                                    placeholder="Write your review here..."
                                    rows="4"
                                    className="w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-orange-500 text-white px-8 py-3 rounded-xl shadow-md hover:bg-orange-600 transition"
                            >
                                Submit Review
                            </button>
                        </form>

                        {/* Display Reviews */}
                        <div>
                            {reviews.map((review) => (
                                <div key={review._id} className="bg-gray-50 p-4 rounded-xl shadow-md mb-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-semibold text-gray-800">{review.studentName}</span>
                                        <span className="text-yellow-500">{'⭐'.repeat(review.rating)}</span>
                                    </div>
                                    <p className="text-gray-600 mt-2">{review.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeacherProfile;
