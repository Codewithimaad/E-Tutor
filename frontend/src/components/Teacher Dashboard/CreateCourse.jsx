import { useState } from "react";

const CreateCourse = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Course Created:", { title, description });
        // Send course data to the backend here
    };

    return (
        <div className="w-full bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-4">
                Create a New Course
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Introduction to Python"
                        className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Briefly describe the course content and objectives..."
                        className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-md"
                >
                    Create Course
                </button>
            </form>
        </div>
    );
};

export default CreateCourse;
