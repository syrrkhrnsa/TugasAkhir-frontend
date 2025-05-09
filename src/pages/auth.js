import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import Navbar from "../components/Navbar";
import { setAuthData } from "../utils/Auth";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        username,
        password,
      });

      console.log("Token dari server:", response.data.token);

      // Simpan token ke localStorage
      localStorage.setItem("token", response.data.token);

      // Panggil fungsi untuk menyimpan user_id dan role_id
      storeUserData(response.data);

      // Cek di console log
      console.log("Data lengkap dari server:", response.data);

      navigate("/dashboard");
    } catch (err) {
      setError("Login failed. Please check your credentials.");
    }
  };

  // Fungsi untuk mengambil user_id dan role_id dari response dan menyimpannya ke localStorage
  const storeUserData = (data) => {
    if (data.user) {
      const userId = data.user.id;
      const roleId = data.user.role?.id;
      const userName = data.user.name;

      if (userId) {
        localStorage.setItem("user_id", userId);
        console.log("User ID:", userId);
      }

      if (roleId) {
        localStorage.setItem("role_id", roleId);
        console.log("Role ID:", roleId);
      }

      if (userName) {
        localStorage.setItem("user_name", userName); // Simpan nama pengguna
        console.log("User Name:", userName);
      }

      // Simpan di variabel statis
      setAuthData(userId, roleId);
    } else {
      console.warn(
        "User ID, Role ID, atau User Name tidak ditemukan dalam response"
      );
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
          <div className="flex items-center space-x-1">
            {/* Logo */}
            <img src={logo} alt="Logo" className="w-20 h-auto" />
            {/* Teks */}
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold text-hijau">Waqf</h1>
                <h1 className="text-3xl font-bold text-kuning">Management</h1>
              </div>
              <h2 className="text-2xl font-bold text-hijau">
                PC Persis Banjaran
              </h2>
            </div>
          </div>
        </div>

        {/* Konten Kanan */}
        <div className="flex justify-center items-center w-full lg:w-1/2 px-4 lg:px-6">
          <div
            className="bg-white rounded-2xl p-8 w-full max-w-xs"
            style={{
              boxShadow:
                "0px -20px 40px rgba(0, 0, 0, 0.1), 20px 0px 40px rgba(0, 0, 0, 0.1)", // Shadow di atas dan kanan
            }}
          >
            {/* Header */}
            <h1 className="text-3xl font-bold text-left text-hijau">Masuk</h1>
            <p className="text-left text-xs text-gray-500 mt-1">
              We are very happy to see you back!
            </p>

            {/* Error Message */}
            {error && (
              <p className="text-red-500 text-xs mt-1 text-center">{error}</p>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="mt-3 space-y-2">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-3 py-1.5 mt-1 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-hijaulogin focus:outline-none text-xs"
                  placeholder="Enter your username"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-3 py-1.5 mt-1 border border-gray-300 rounded-lg shadow-sm focus:ring focus:ring-hijaulogin focus:outline-none text-xs"
                  placeholder="Enter your password"
                  required
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full py-2 text-xs font-medium text-white bg-hijaulogin hover:bg-green-700 rounded-lg shadow-md"
              >
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
