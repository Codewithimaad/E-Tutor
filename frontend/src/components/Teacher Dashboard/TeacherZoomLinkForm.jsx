import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../../context/userContextApi";

const TeacherZoomLinkForm = () => {
    const [zoomLink, setZoomLink] = useState("");
    const { user, backendUrl, token } = useContext(UserContext);

    useEffect(() => {
        const fetchExistingZoomLink = async () => {
            try {
                const res = await axios.get(
                    `${backendUrl}api/users/${user._id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.data.zoomLink) {
                    setZoomLink(res.data.zoomLink);
                }
            } catch (err) {
                console.error("Failed to fetch existing Zoom link", err);
            }
        };

        if (user?.role === "teacher") {
            fetchExistingZoomLink();
        }
    }, [user, backendUrl, token]);

    const handleZoomLinkSave = async () => {
        try {
            const res = await axios.post(
                `${backendUrl}api/users/${user._id}/zoom-link`,  // Use POST instead of PUT
                { zoomLink },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert("Zoom link updated successfully!");
        } catch (err) {
            console.error("Failed to update Zoom link", err);
            alert("Error updating Zoom link.");
        }
    };

    return (
        <div className="bg-white shadow p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Set Your Zoom Link</h2>
            <input
                type="text"
                value={zoomLink}
                onChange={(e) => setZoomLink(e.target.value)}
                placeholder="Enter your Zoom meeting link"
                className="w-full border p-2 rounded mb-4"
            />
            <button
                onClick={handleZoomLinkSave}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Save Zoom Link
            </button>
        </div>
    );
};

export default TeacherZoomLinkForm;
