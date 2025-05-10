import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../context/userContextApi";
import socket from "../socket";
import { useParams } from "react-router-dom";


const StudentMessage = () => {
    const { user, token, backendUrl } = useContext(UserContext);
    const [teachers, setTeachers] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState({
        users: false,
        messages: false,
        sending: false
    });
    const [error, setError] = useState({
        users: null,
        messages: null,
        sending: null
    });
    const [userStatuses, setUserStatuses] = useState({});
    const { teacherId } = useParams();


    useEffect(() => {
        const fetchTeachers = async () => {
            if (!user || !token || user.role !== "student") return;

            setLoading(prev => ({ ...prev, users: true }));
            setError(prev => ({ ...prev, users: null }));

            try {
                const res = await axios.get(`${backendUrl}api/users/get-teachers`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const initialStatuses = {};
                res.data.forEach(teacher => {
                    initialStatuses[teacher._id] = {
                        online: teacher.online || false,
                        lastSeen: teacher.lastSeen || null,
                    };
                });

                setUserStatuses(initialStatuses);
                setTeachers(res.data);

                const selectedTeacher = teacherId
                    ? res.data.find(t => t._id === teacherId)
                    : res.data[0];

                setActiveChat(selectedTeacher || null);
            } catch (err) {
                console.error("Error fetching teachers:", err);
                setError(prev => ({
                    ...prev,
                    users: err.response?.data?.message || "Failed to load teachers"
                }));
            } finally {
                setLoading(prev => ({ ...prev, users: false }));
            }
        };

        fetchTeachers();
    }, [user, token, backendUrl, teacherId]);


    // Fetch chat messages when activeChat changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeChat || !user || !token) return;

            setLoading(prev => ({ ...prev, messages: true }));
            setError(prev => ({ ...prev, messages: null }));

            try {
                const res = await axios.get(
                    `${backendUrl}api/messages/${user._id}/${activeChat._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setChatMessages(res.data);
            } catch (err) {
                console.error("Error fetching messages:", err);
                setError(prev => ({
                    ...prev,
                    messages: err.response?.data?.message || "Failed to load messages"
                }));
            } finally {
                setLoading(prev => ({ ...prev, messages: false }));
            }
        };

        fetchMessages();
    }, [activeChat, user, token, backendUrl]);

    // Socket.IO listeners
    useEffect(() => {
        if (!socket || !user) return;

        // Notify server that user is online
        socket.emit('user-online', user._id);

        // Listen for status changes
        socket.on('user-status-changed', ({ userId, status }) => {
            setUserStatuses(prev => ({
                ...prev,
                [userId]: status
            }));
        });

        // Listen for new messages
        socket.on('receive-message', (message) => {
            if (
                (message.senderId === activeChat?._id && message.receiverId === user._id) ||
                (message.senderId === user._id && message.receiverId === activeChat?._id)
            ) {
                setChatMessages(prev => [...prev, message]);
            }
        });

        return () => {
            socket.off('user-status-changed');
            socket.off('receive-message');
        };
    }, [user, activeChat]);

    // Send message
    const sendMessage = async () => {
        if (!newMessage.trim() || !activeChat) return;

        setLoading(prev => ({ ...prev, sending: true }));
        setError(prev => ({ ...prev, sending: null }));

        try {
            const res = await axios.post(
                `${backendUrl}api/messages`,
                {
                    senderId: user._id,
                    receiverId: activeChat._id,
                    text: newMessage,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setChatMessages(prev => [...prev, res.data]);
            setNewMessage("");
            socket.emit("send-message", res.data);
        } catch (err) {
            console.error("Error sending message:", err);
            setError(prev => ({
                ...prev,
                sending: err.response?.data?.message || "Failed to send message"
            }));
        } finally {
            setLoading(prev => ({ ...prev, sending: false }));
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Format last seen time
    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return "Never";

        const now = new Date();
        const lastSeenDate = new Date(lastSeen);
        const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));

        if (diffMinutes < 1) return "Just now";
        if (diffMinutes < 60) return `${diffMinutes} min ago`;
        if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;

        return lastSeenDate.toLocaleDateString();
    };

    return (
        <div className="flex h-[calc(100vh-150px)] bg-gray-100 rounded-lg overflow-hidden">
            {/* Sidebar */}
            <div className="w-1/3 bg-white shadow-md p-4 border-r">
                <h2 className="text-lg font-semibold mb-4">Teachers</h2>

                {loading.users ? (
                    <p className="text-gray-500">Loading teachers...</p>
                ) : error.users ? (
                    <p className="text-red-500">{error.users}</p>
                ) : teachers.length === 0 ? (
                    <p className="text-gray-500">No teachers available</p>
                ) : (
                    <div className="overflow-y-auto">
                        {teachers.map((teacher) => (
                            <div
                                key={teacher._id}
                                onClick={() => setActiveChat(teacher)}
                                className={`p-3 rounded-lg mb-2 cursor-pointer flex items-center ${activeChat?._id === teacher._id
                                    ? "bg-orange-100"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <img
                                    src={teacher.image || "https://via.placeholder.com/40"}
                                    alt={teacher.firstName}
                                    className="w-10 h-10 rounded-full mr-3"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold truncate">{teacher.firstName} {teacher.lastName}</p>
                                    <p className="text-sm truncate text-gray-500">
                                        {userStatuses[teacher._id]?.online
                                            ? <span className="text-green-500">Online</span>
                                            : <span>Last seen {formatLastSeen(userStatuses[teacher._id]?.lastSeen)}</span>
                                        }
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Chat Section */}
            <div className="w-2/3 bg-white flex flex-col">
                {!activeChat ? (
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500">Select a teacher to start chatting</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center border-b p-4">
                            <img
                                src={activeChat.image || "https://via.placeholder.com/40"}
                                alt={activeChat.firstName}
                                className="w-10 h-10 rounded-full mr-3"
                            />
                            <div>
                                <p className="font-bold">{activeChat.firstName} {activeChat.lastName}</p>
                                <p className="text-sm">
                                    {userStatuses[activeChat._id]?.online
                                        ? <span className="text-green-500">Online</span>
                                        : <span>Last seen {formatLastSeen(userStatuses[activeChat._id]?.lastSeen)}</span>
                                    }
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            {loading.messages && chatMessages.length === 0 ? (
                                <p className="text-gray-500">Loading messages...</p>
                            ) : error.messages ? (
                                <p className="text-red-500">{error.messages}</p>
                            ) : chatMessages.length === 0 ? (
                                <p className="text-gray-500">No messages yet. Start the conversation!</p>
                            ) : (
                                chatMessages.map((msg, idx) => {
                                    const senderId = typeof msg.senderId === "object" && msg.senderId !== null
                                        ? msg.senderId._id || msg.senderId
                                        : msg.senderId;

                                    const isSender = String(senderId) === String(user._id);
                                    return (
                                        <div
                                            key={idx}
                                            className={`flex mb-4 ${isSender ? "justify-end" : "justify-start"}`}
                                        >
                                            <div className={`p-3 rounded-lg max-w-xs lg:max-w-md ${isSender
                                                ? "bg-orange-500 text-white"
                                                : "bg-gray-200"}`}>
                                                <p>{msg.text}</p>
                                                <p className="text-xs mt-1 opacity-70">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="border-t p-4 bg-white">
                            {error.sending && <p className="text-red-500 text-sm mb-2">{error.sending}</p>}
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Type a message..."
                                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    disabled={loading.sending}
                                />
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim() || loading.sending}
                                    className={`ml-3 px-4 py-2 rounded-lg ${!newMessage.trim() || loading.sending
                                        ? "bg-gray-300 cursor-not-allowed"
                                        : "bg-orange-500 hover:bg-orange-600 text-white"}`}
                                >
                                    {loading.sending ? "Sending..." : "Send"}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default StudentMessage;
