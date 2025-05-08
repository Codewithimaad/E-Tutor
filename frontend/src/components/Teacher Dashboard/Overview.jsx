import React from "react";
import { Users, BookOpen, Mail } from "lucide-react"; // You can use other icon libraries if preferred

const Overview = () => {
    const stats = [
        {
            label: "Total Students",
            value: 24,
            icon: <Users className="w-5 h-5 text-indigo-600" />,
        },
        {
            label: "Active Courses",
            value: 3,
            icon: <BookOpen className="w-5 h-5 text-green-600" />,
        },
        {
            label: "Unread Messages",
            value: 5,
            icon: <Mail className="w-5 h-5 text-orange-600" />,
        },
    ];

    return (
        <div className="w-full bg-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4">
                Dashboard Overview
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-4 p-5 bg-gray-50 rounded-xl hover:shadow-md transition"
                    >
                        <div className="p-3 bg-gray-100 rounded-full">
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-2xl font-semibold text-gray-800">{stat.value}</p>
                            <p className="text-sm text-gray-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Overview;
