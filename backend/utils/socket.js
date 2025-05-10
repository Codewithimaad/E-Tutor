// socket.js
import { Server } from "socket.io";
import User from "../models/userModel.js";

const onlineUsers = new Map(); // socket.id -> userId
const userStatuses = new Map(); // userId -> { online, lastSeen }

export const setupSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        pingInterval: 10000,
        pingTimeout: 5000,
    });

    io.on("connection", (socket) => {
        console.log("⚡ New client connected:", socket.id);

        socket.on("user-online", async (userId) => {
            try {
                onlineUsers.set(socket.id, userId);
                userStatuses.set(userId, { online: true, lastSeen: null });

                await User.findByIdAndUpdate(userId, {
                    online: true,
                    lastSeen: null,
                });

                io.emit("user-status-changed", {
                    userId,
                    status: { online: true, lastSeen: null },
                });

                console.log(`✅ User ${userId} is online`);
            } catch (error) {
                console.error("Error updating user status:", error);
            }
        });

        socket.on("send-message", (message) => {
            io.emit("receive-message", message);
        });

        socket.on("disconnect", async () => {
            const userId = onlineUsers.get(socket.id);
            if (userId) {
                const lastSeen = new Date();

                onlineUsers.delete(socket.id);
                userStatuses.set(userId, { online: false, lastSeen });

                try {
                    await User.findByIdAndUpdate(userId, {
                        online: false,
                        lastSeen,
                    });

                    io.emit("user-status-changed", {
                        userId,
                        status: { online: false, lastSeen },
                    });

                    console.log(`❌ User ${userId} disconnected at ${lastSeen}`);
                } catch (error) {
                    console.error("Error updating user status:", error);
                }
            }
        });
    });

    return io;
};
