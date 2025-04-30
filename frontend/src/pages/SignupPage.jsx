import React, { useState } from "react";
import axios from "axios"; // ✅ Import axios
import { useNavigate } from 'react-router-dom';
import rightImg from '../assets/signup-page/Saly-1.png';
import { GoogleLogin } from '@react-oauth/google';
import { toast } from "react-toastify";


const SignupPage = () => {
  const navigate = useNavigate();

  // ✅ Manage form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');

  // ✅ Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/users/signup', formData);

      console.log(response.data);

      alert('Signup successful! Please login.');
      navigate('/login-page'); // ✅ After signup, go to login page
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Signup failed.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="flex-1 flex items-center justify-center bg-indigo-50 relative">
        <img
          src={rightImg}
          alt="Rocket Illustration"
          className="w-[80%] h-auto"
        />
      </div>

      {/* Right Section */}
      <div className="flex-1 flex flex-col justify-center items-center bg-white p-12">
        <div className="max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 text-center">
            Create your account
          </h1>

          {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex gap-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />

            <div className="flex gap-4">
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create password"
                className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="mr-2 w-5 h-5 focus:ring-indigo-400"
                required
              />
              <label htmlFor="terms" className="text-gray-600 text-sm">
                I agree with all of your <a className="text-indigo-600">Terms & Conditions</a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white p-3 rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              Create Account
            </button>
          </form>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-gray-300" />
            <span className="mx-4 text-gray-400">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          <div className="flex justify-between gap-4">
            <div className="flex-1">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  try {
                    const { credential } = credentialResponse;

                    // Send credential to backend
                    const res = await axios.post('http://localhost:5000/api/users/google-login', {
                      credential,
                    });

                    console.log(res.data);

                    toast.success('Google signup successful!');
                    localStorage.setItem('token', res.data.token);
                    navigate('/dashboard-page'); // or any route you want
                  } catch (error) {
                    console.error(error);
                    setError('Google login failed');
                  }
                }}
                onError={() => {
                  setError('Google login was unsuccessful');
                }}
              />
            </div>

            <button className="flex-1 bg-gray-100 text-gray-600 p-3 rounded-lg hover:bg-gray-200">
              Facebook
            </button>
            <button className="flex-1 bg-gray-100 text-gray-600 p-3 rounded-lg hover:bg-gray-200">
              Apple
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;
