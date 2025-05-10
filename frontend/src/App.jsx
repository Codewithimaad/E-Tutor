import React, { useContext, useEffect } from 'react';
import ScrollToTop from './components/SMALL_components/ScrollToTop';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NavMenu from './components/Nav_Menu';
import BecomeTutorForm from './components/BecomeTutorForm';
import HomePage from './pages/Homepage';
import SignupPage from './pages/SignupPage';
import SignInPage from './pages/SignInPage';
import Dashboard from './pages/Dashboard-page';
import UserContextProvider, { UserContext } from './context/userContextApi';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'react-toastify/dist/ReactToastify.css';
import RoleSelectionPage from './pages/RoleSelectionPage';
import TeacherDashboard from './pages/TeacherDashboard';
import ProtectedRoutes from './components/ProtectedRoutes';
import TeacherProfile from './pages/TeacherProfile';
import Message from './pages/Message';
import socket from './socket'; // ✅ Import socket
import StudentMessage from './pages/StudentMessgae';

function AppContent() {
  const { user } = useContext(UserContext); // ✅ Get user from context

  useEffect(() => {
    if (user?._id) {
      socket.emit('user-online', user._id); // Notify server that the user is online
    }

    return () => {
      // Clean up by removing event listeners (not disconnecting the socket)
      socket.off('connect');
      socket.off('disconnect');
      socket.off('user-status-changed');
      socket.off('receive-message');
    };
  }, [user]);

  return (
    <div className="bg-white min-h-screen font-sans">
      <ScrollToTop />
      <NavMenu />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/become-tutor-form" element={<BecomeTutorForm />} />
        <Route path="/signup-page" element={<SignupPage />} />
        <Route path="/signin-page" element={<SignInPage />} />
        <Route path="/dashboard" element={<ProtectedRoutes />} />
        <Route path="/dashboard-page" element={<Dashboard />} />
        <Route path="/message" element={<Message />} />
        <Route path="/student-message/:teacherId" element={<StudentMessage />} />
        <Route path="/student-message" element={<StudentMessage />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/select-role" element={<RoleSelectionPage />} />
        <Route path="/teachers/:id" element={<TeacherProfile />} />
      </Routes>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <Router>
        <UserContextProvider>
          <AppContent />
          <ToastContainer position="top-right" autoClose={3000} />
        </UserContextProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
