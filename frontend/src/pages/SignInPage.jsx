import React, { useState, useContext } from "react";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import illustration from '../assets/signin-page/Illustrations.png';
import { toast } from 'react-toastify';
import { UserContext } from "../context/userContextApi"; // ✅ Import context

const SignInPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { setToken, setUser } = useContext(UserContext); // ✅ Use context

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', { email, password });

      const { token, user, message } = response.data;

      localStorage.setItem('token', token);
      setToken(token);        // ✅ Set token in context
      setUser(user);          // ✅ Set user in context

      toast.success(message);

      if (user?.role && user.role === 'student') {
        navigate('/dashboard-page');
      }
      else if (user?.role && user.role === 'teacher') {
        navigate('/teacher-dashboard');
      }
      else {
        navigate('/select-role');
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const res = await axios.post('http://localhost:5000/api/users/google-login', {
        credential: response.credential,
      });

      const { token, user, success, message } = res.data;

      if (success) {
        toast.success(message);
        localStorage.setItem('token', token);
        setToken(token);      // ✅ Set token in context
        setUser(user);        // ✅ Set user in context

        if (user?.role && user.role === 'student') {
          navigate('/dashboard-page');
        }
        else if (user?.role && user.role === 'teacher') {
          navigate('/teacher-dashboard');
        }
        else {
          navigate('/select-role');
        }
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.error("Google Login Error:", error);
      toast.error('Google login failed. Please try again.');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Google Login Error:", error);
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex justify-center items-center bg-blue-100">
        <img src={illustration} alt="Illustration" className="max-w-md" />
      </div>

      <div className="flex-1 flex justify-center items-center">
        <div className="w-96 p-8 shadow-lg rounded-lg border">
          <h2 className="text-2xl font-semibold text-center mb-6">Sign in to your account</h2>

          {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Username or email address..."
              className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <label className="block mb-2 text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 border rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <div className="flex items-center justify-between mb-4">
              <div>
                <input type="checkbox" id="remember" className="mr-2" />
                <label htmlFor="remember" className="text-gray-700">Remember me</label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
            >
              Sign in →
            </button>
          </form>

          <div className="text-center my-4 text-gray-500">OR</div>

          <div className="flex justify-center space-x-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
              useOneTap
              theme="outline"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
