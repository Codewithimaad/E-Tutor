import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Overview from "../components/Dashboard-Component/Overview";
import Teachers from "../components/Dashboard-Component/Teachers";
import PurchaseHistory from "../components/Dashboard-Component/PurchaseHistory";
import Settings from "../components/Dashboard-Component/Settings";
import { UserContext } from "../context/userContextApi";
import StudentMessage from "./StudentMessgae";
import StudentZoomLink from '../components/Dashboard-Component/StudentZoomLink';

const Dashboard = () => {
  const [activeComponent, setActiveComponent] = useState(<Overview />);
  const { token, user, loading } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!loading) {
        if (!token || !user) {
          toast.error("You need to log in to access the dashboard.");
          navigate("/dashboard");
        } else if (!user.role) {
          toast.error("Please select your role first.");
          navigate("/dashboard");
        } else if (user.role !== "student") {
          toast.error("Access denied. You're not a student.");
          navigate("/dashboard");
        }
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, [loading, token, user, navigate]);

  const handleTabClick = (component) => {
    if (component.type?.name === "StudentMessage") {
      navigate("/student-message"); // Navigate to student message route
    } else {
      setActiveComponent(component);
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading dashboard...</div>;
  }

  if (!token || !user || user.role !== "student") return null;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="bg-white shadow-md rounded-xl p-6 flex justify-between items-center">
        <div>
          <img className="w-20 rounded-full" src={user.image} alt="User Avatar" />
          <h1 className="text-xl font-bold">{user.firstName} {user.lastName}</h1>
          <p className="text-gray-600">{user.bio}</p>
        </div>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
          Become Instructor
        </button>
      </div>

      <div className="bg-white shadow-md rounded-xl mt-4 p-4 flex gap-6">
        <button
          onClick={() => handleTabClick(<Overview />)}
          className={`pb-1 font-semibold ${activeComponent.type === Overview ? "border-b-2 border-black" : "text-gray-500"}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => handleTabClick(<Teachers />)}
          className={`pb-1 font-semibold ${activeComponent.type === Teachers ? "border-b-2 border-black" : "text-gray-500"}`}
        >
          Teachers
        </button>
        <button
          onClick={() => handleTabClick(<StudentMessage />)}
          className={`pb-1 font-semibold ${activeComponent.type === StudentMessage ? "border-b-2 border-black" : "text-gray-500"}`}
        >
          Message
        </button>
        <button
          onClick={() => handleTabClick(<PurchaseHistory />)}
          className={`pb-1 font-semibold ${activeComponent.type === PurchaseHistory ? "border-b-2 border-black" : "text-gray-500"}`}
        >
          Purchase History
        </button>
        <button
          onClick={() => handleTabClick(< StudentZoomLink />)}
          className={`pb-1 font-semibold ${activeComponent.type === StudentZoomLink ? "border-b-2 border-black" : "text-gray-500"}`}
        >
          Zoom Link
        </button>
        <button
          onClick={() => handleTabClick(<Settings />)}
          className={`pb-1 font-semibold ${activeComponent.type === Settings ? "border-b-2 border-black" : "text-gray-500"}`}
        >
          Settings
        </button>
      </div>

      <div className="mt-6">
        {activeComponent}
      </div>
    </div>
  );
};

export default Dashboard;