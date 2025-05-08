import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/Home-page-images/logoImage.png';
import { IoSearchOutline } from "react-icons/io5";
import { UserContext } from '../context/userContextApi';

const Navbar = () => {
  const navigate = useNavigate();
  const { token, logout, user } = useContext(UserContext);

  return (
    <nav className="bg-gray-100 p-4 flex justify-between items-center sticky top-12 z-50">
      <div className="flex items-center">
        <Link to="/" className="text-xl font-bold flex items-center">
          <img src={logo} alt="E-tutor Logo" className="h-8 mr-2" />
          E-tutor
        </Link>
        <div className="relative ml-20 w-[300px]">
          <input
            type="text"
            placeholder="What do you want to learn..."
            className="border rounded-md h-11 pl-10 pr-4 w-full"
          />
          <IoSearchOutline className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {token ? (
          <div className='flex space-x-3'>
            {/* Conditional Dashboard Link */}
            {user?.role === 'student' && (
              <Link
                to="/dashboard-page"
                className="text-[#FF6636] bg-[#FFEEE8] p-4 rounded-md h-11 flex items-center font-semibold"
              >
                Dashboard
              </Link>
            )}
            {user?.role === 'teacher' && (
              <Link
                to="/teacher-dashboard"
                className="text-[#FF6636] bg-[#FFEEE8] p-4 rounded-md h-11 flex items-center font-semibold"
              >
                Dashboard
              </Link>
            )}
            <button
              onClick={logout}
              className="text-[#FF6636] bg-[#FFEEE8] p-4 rounded-md h-11 flex items-center font-semibold"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate('/signin-page')}
              className="text-[#FF6636] bg-[#FFEEE8] p-4 rounded-md h-11 flex items-center font-semibold"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup-page')}
              className="bg-[#FF6636] text-white p-4 rounded-md h-11 flex items-center font-semibold"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
