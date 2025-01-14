import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import Navbar from "../components/Navbar";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      // Simpan token di local storage
      localStorage.setItem("token", response.data.token);

      // Redirect ke halaman dashboard
      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  return (
    <>
      {/* Panggil Navbar */}
      <Navbar />
      <div className="flex flex-col lg:flex-row h-screen bg-white">
        {/* Konten Kiri */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 px-10 lg:px-20 bg-white">
          {/* Logo dan Teks */}
          <div className="flex items-center space-x-4">
            {/* Logo */}
            <img src={logo} alt="Logo" className="w-23 h-auto" />
            {/* Teks */}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-5xl font-bold text-hijau">Waqaf</h1>
                <h1 className="text-5xl font-bold text-kuning">Management</h1>
              </div>
              <h2 className="text-4xl font-bold text-hijau mt-2">
                PC Persis Banjaran
              </h2>
            </div>
          </div>
        </div>

        {/* Konten Kanan */}
        <div className="flex justify-center items-center w-full lg:w-1/2 px-8 lg:px-16">
          <div
            className="bg-white rounded-3xl p-8 w-full max-w-lg"
            style={{
              boxShadow:
                "0px -20px 40px rgba(0, 0, 0, 0.1), 20px 0px 40px rgba(0, 0, 0, 0.1)", // Shadow di atas dan kanan
            }}
          >
            {/* Header */}
            <h1 className="text-5xl font-bold text-left text-hijau">Login</h1>
            <p className="text-left text-gray-500 mt-2">
              We are very happy to see you back!
            </p>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-5 py-3 mt-2 border border-gray-300 rounded-lg shadow-md focus:ring focus:ring-hijaulogin focus:outline-none"
                  placeholder="pimpinan@gmail.com"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-5 py-3 mt-2 border border-gray-300 rounded-lg shadow-md focus:ring focus:ring-hijaulogin focus:outline-none"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm mt-2">
                <label className="flex items-center text-fontlogin space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span>Remember Me</span>
                </label>
                <a href="#" className="text-fontlogin hover:underline">
                  Forgot your password?
                </a>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-3 text-lg font-medium text-white bg-hijaulogin hover:bg-green-700 rounded-lg shadow-md"
              >
                Login
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center py-5">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="px-3 text-fontlogin">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Login with Google */}
            <div className="flex justify-center">
              <button
                type="button"
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  className="w-5 h-5 mr-3"
                />
                <span className="text-sm font-medium text-fontlogin">
                  Login with Google
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
