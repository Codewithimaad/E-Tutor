import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/userContextApi";
import { toast } from "react-toastify";

const ProtectedRoutes = () => {
    const { user, token, loading } = useContext(UserContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!token || !user) {
                toast.error("Access denied. Please log in first.");
                navigate("/signin-page");
            } else if (!user.role) {
                toast.error("Please select your role first.");
                navigate("/select-role");
            } else if (user.role === "teacher") {
                navigate("/teacher-dashboard");
            } else if (user.role === "student") {
                navigate("/dashboard-page");
            } else {
                toast.error("Unknown role. Access denied.");
                navigate("/signin-page");
            }
        }
    }, [loading, user, token, navigate]);

    return null;
};

export default ProtectedRoutes;
