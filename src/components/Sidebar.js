import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import user from "../assets/profile.png";
import message from "../assets/icon.png";
import {
  FaTh,
  FaMapMarkedAlt,
  FaCertificate,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTh /> },
    { name: "Tanah Wakaf", path: "/sertifikat", icon: <FaCertificate /> },
    { name: "Pemetaan", path: "/pemetaan", icon: <FaMapMarkedAlt /> },
  ];

  // Initialize last login time on first load and reset on logout
  const updateLoginTime = () => {
    const now = new Date().toISOString();
    localStorage.setItem("lastLoginTime", now);
    localStorage.removeItem("lastViewedNotifications");
  };

  // Fetch notifications and calculate unread count
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://127.0.0.1:8000/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.data && Array.isArray(response.data.data)) {
        const lastLoginTime = localStorage.getItem("lastLoginTime");
        const lastViewedTime = localStorage.getItem("lastViewedNotifications") || lastLoginTime;

        // Count notifications newer than last viewed time
        const newNotifications = response.data.data.filter(
          notification => new Date(notification.created_at) > new Date(lastViewedTime)
        );
        setUnreadCount(newNotifications.length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Reset count when visiting notifications page
  useEffect(() => {
    if (location.pathname === "/notifikasi") {
      const now = new Date().toISOString();
      localStorage.setItem("lastViewedNotifications", now);
      setUnreadCount(0);
    }
  }, [location.pathname]);

  // Initialize login time and fetch notifications on mount
  useEffect(() => {
    if (!localStorage.getItem("lastLoginTime")) {
      updateLoginTime();
    }
    
    fetchNotifications();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      if (token) {
        await axios.post(
          "http://127.0.0.1:8000/api/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
      }

      // Clear user session data
      localStorage.removeItem("token");
      setUnreadCount(0);
      
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden">
      {/* SIDEBAR */}
      <div
        className={`fixed top-4 left-4 bottom-4 bg-white shadow-xl rounded-3xl p-5 flex flex-col transition-all duration-300 ${
          isOpen ? "w-56" : "w-20"
        }`}
      >
        {/* TOGGLE BUTTON */}
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="text-gray-500 hover:text-gray-700"
          >
            <FaBars size={15} />
          </button>
        </div>

        {/* LOGO */}
        <div
          className={`flex items-center mb-10 transition-all ${
            isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
          }`}
        >
          <img src={logo} alt="Logo" className="h-8" /> {/* Hapus mt-5 */}
          <div className="ml-1">
            <h1 className="text-sm font-bold">
              <span className="text-green-600">Waqf</span>{" "}
              <span className="text-yellow-500">Management</span>
            </h1>
            <p className="text-xs font-bold text-green-600">PC Persis Banjaran</p>
          </div>
        </div>

        {/* MENU ITEMS */}
        {menuItems.map((menu) => {
          const isActive = location.pathname === menu.path;
          return (
            <div
              key={menu.name}
              className={`w-full mx-auto p-3 flex items-center mb-3 cursor-pointer rounded-xl transition-all ${
                isActive
                  ? "bg-yellow-500 shadow-md text-white"
                  : "text-gray-500 hover:bg-gray-200"
              }`}
              onClick={() => navigate(menu.path)}
            >
              <div className="flex items-center space-x-3">
                {React.cloneElement(menu.icon, {
                  className: isActive
                    ? "text-white text-lg"
                    : "text-gray-500 text-lg",
                })}
                <span
                  className={`text-xs font-medium ${
                    isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                  }`}
                >
                  {menu.name}
                </span>
              </div>
            </div>
          );
        })}

        {/* LOGOUT */}
        <div
          className="w-full mx-auto p-3 flex items-center mt-auto cursor-pointer hover:bg-gray-200 rounded-xl"
          onClick={handleLogout}
        >
          <div className="flex items-center space-x-3">
            <FaSignOutAlt className="text-gray-500 text-lg" />
            <span className={`text-gray-500 text-sm font-medium transition-all ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
              Keluar
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className={`flex flex-col flex-1 h-full transition-all duration-300 overflow-auto ${
          isOpen ? "ml-56" : "ml-20"
        } p-4 md:p-8`}
      >
        {/* HEADER */}
        <header className="bg-white rounded-xl shadow-md px-6 py-3 md:px-10 md:py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-700"></h1>
          <div className="flex items-center gap-4">
            <div 
              className="relative cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                const now = new Date().toISOString();
                localStorage.setItem("lastViewedNotifications", now);
                setUnreadCount(0);
                navigate("/notifikasi");
              }}
            >
              <img src={message} alt="Notifications" className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 font-semibold">Hi,</span>
              <span className="text-green-600 font-semibold">User!</span>
              <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-gray-200 rounded-full">
                <img
                  src={user}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            </div>
          </div>
        </header>

        {/* MAIN CONTENT & FOOTER */}
        <div className="flex-1 bg-white shadow-lg rounded-xl mt-4 p-4 md:p-6 flex flex-col justify-between h-full">
          <div className="flex-1 overflow-auto">{children}</div>
          <footer className="text-center text-xs text-gray-600 mt-6">
            © 2025 PC Persis Banjaran
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;