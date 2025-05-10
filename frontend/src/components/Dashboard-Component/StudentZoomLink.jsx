import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { UserContext } from "../../context/userContextApi";

const StudentZoomLink = ({ teacherId }) => {
    const [zoomLink, setZoomLink] = useState(null);
    const [error, setError] = useState("");
    const { backendUrl, token, user } = useContext(UserContext);

    useEffect(() => {
        const fetchZoomLink = async () => {
            try {
                const res = await axios.get(
                    `${backendUrl}api/users/${teacherId}/zoom-link-for-student/${user._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log("Zoom Link", res.data.zoomLink);

                setZoomLink(res.data.zoomLink);
            } catch (err) {
                setError("Zoom link unavailable or you are not enrolled.");
                setZoomLink(null);
            }
        };

        if (teacherId && user?._id) {
            fetchZoomLink();
        }
    }, [teacherId, user?._id]);

    return (
        <div className="bg-white p-4 shadow rounded-md mt-4">
            <h2 className="text-lg font-semibold mb-2">Zoom Call</h2>
            {zoomLink !== null ? (
                <a
                    href={zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                >
                    Join Zoom Meeting
                </a>
            ) : (
                <p className="text-red-500">{error}</p>
            )}
        </div>
    );
};

export default StudentZoomLink;
