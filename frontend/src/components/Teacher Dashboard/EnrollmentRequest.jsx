import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from '../../context/userContextApi';

const EnrollmentRequests = () => {
    const { token, user, backendUrl } = useContext(UserContext);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${backendUrl}api/enrollments/requests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(res.data.requests || []);
        } catch (err) {
            console.error('Failed to fetch requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async (requestId, decision) => {
        try {
            await axios.put(`${backendUrl}api/enrollments/requests/${requestId}`, {
                status: decision,
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(prev => prev.filter(r => r._id !== requestId));
        } catch (err) {
            console.error(`Failed to ${decision} request:`, err);
        }
    };

    useEffect(() => {
        if (user?.role === 'teacher') fetchRequests();
    }, [user]);

    if (loading) return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-50 rounded border border-gray-100"></div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Enrollment Requests</h2>
                {requests.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                        {requests.length} pending request{requests.length !== 1 ? 's' : ''}
                    </p>
                )}
            </div>

            <div className="divide-y divide-gray-100">
                {requests.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500 text-sm">No pending enrollment requests</p>
                        <p className="text-xs text-gray-400 mt-1">New requests will appear here</p>
                    </div>
                ) : (
                    requests.map(req => (
                        <div key={req._id} className="p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {req.student.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Requested to join your class
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(req.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                    <button
                                        onClick={() => handleDecision(req._id, 'approved')}
                                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-700 hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleDecision(req._id, 'rejected')}
                                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EnrollmentRequests;