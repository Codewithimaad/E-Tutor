import React from 'react';
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
import UserContextProvider from './context/userContextApi';
import { ToastContainer } from 'react-toastify';
import { GoogleOAuthProvider } from '@react-oauth/google'; // ✅ Import Google provider
import 'react-toastify/dist/ReactToastify.css';
import RoleSelectionPage from './pages/RoleSelectionPage';
import TeacherDashboard from './pages/TeacherDashboard';
import ProtectedRoutes from './components/ProtectedRoutes';
import TeacherProfile from './pages/TeacherProfile';

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}> {/* ✅ Replace this */}
      <Router>
        <UserContextProvider>
          <div className="bg-white min-h-screen font-sans">
            <ScrollToTop />
            <NavMenu />
            <Navbar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/become-tutor-form" element={<BecomeTutorForm />} />
              <Route path="/signup-page" element={<SignupPage />} />
              <Route path="/signin-page" element={<SignInPage />} />
              <Route path="/dashboard" element={<ProtectedRoutes />} /> {/* ✅ Smart redirect based on role */}
              <Route path="/dashboard-page" element={<Dashboard />} />
              <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
              <Route path="/select-role" element={<RoleSelectionPage />} />
              <Route path="/teachers/:id" element={<TeacherProfile />} />
            </Routes>
            <Footer />
          </div>
          <ToastContainer position="top-right" autoClose={3000} />
        </UserContextProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
