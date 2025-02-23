import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import user from "../assets/profile.png";
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
  const [isOpen, setIsOpen] = useState(true); // Toggle sidebar

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTh /> },
    { name: "Pemetaan", path: "/pemetaan", icon: <FaMapMarkedAlt /> },
    { name: "Sertifikasi", path: "/sertifikat", icon: <FaCertificate /> },
  ];

  return (
    <div className="flex w-full h-screen bg-gray-100 overflow-hidden">
      {/* SIDEBAR */}
      <div
        className={`fixed top-4 left-4 bottom-4 bg-white shadow-xl rounded-3xl p-5 flex flex-col transition-all duration-300
          ${isOpen ? "w-56" : "w-20"}`}
      >
        {/* TOGGLE BUTTON */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500">
            <FaBars size={15} />
          </button>
        </div>

        {/* LOGO */}
        <div
          className={`flex items-center mb-10 transition-all ${
            isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
          }`}
        >
          <img src={logo} alt="Logo" className="w-8 h-10" />
          <div className="ml-3">
            <h1 className="text-sm font-bold">
              <span className="text-hijau">Waqaf</span>{" "}
              <span className="text-kuning">Management</span>
            </h1>
            <p className="text-xs font-bold text-hijau">PC Persis Banjaran</p>
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
                  ? "bg-kuning shadow-md text-white"
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
          onClick={() => navigate("/login")}
        >
          <div className="flex items-center space-x-3">
            <FaSignOutAlt className="text-gray-500 text-lg" />
            <span
              className={`text-gray-500 text-sm font-medium transition-all ${
                isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
              }`}
            >
              Keluar
            </span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className={`flex flex-col flex-1 h-full transition-all duration-300 overflow-auto
          ${isOpen ? "ml-56" : "ml-20"} p-4 md:p-8`}
      >
        {/* HEADER */}
        <header className="bg-white rounded-xl shadow-md px-6 py-3 md:px-10 md:py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-700"></h1>
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
        </header>

        {/* MAIN CONTENT & FOOTER */}
        <div className="flex-1 bg-white shadow-lg rounded-xl mt-4 p-4 md:p-6 flex flex-col justify-between h-full">
          {/* Konten Utama */}
          <div className="flex-1 overflow-auto">{children}</div>

          {/* Footer */}
          <footer className="text-center text-xs text-gray-600 mt-6">
            © 2025 PC Persis Banjaran
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
