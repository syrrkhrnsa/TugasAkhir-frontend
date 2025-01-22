import logo from "../assets/logo.png";
import { FaTh, FaMapMarkedAlt, FaCertificate, FaSignOutAlt } from "react-icons/fa";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [activeMenu, setActiveMenu] = useState("Dashboard");
  const navigate = useNavigate(); // Untuk redirect ke route login

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="w-48 bg-white rounded-3xl shadow-2xl mx-4 my-8 p-6 flex flex-col h-[90vh]">
      {/* Logo Section */}
      <div className="flex items-left mb-6">
        <img src={logo} alt="Logo" className="w-6 h-8 mt-2" />
        <div className="text-left ml-2">
          <h1 className="text-[11px] font-bold mt-4">
            <span className="text-hijau">Waqaf</span>{" "}
            <span className="text-kuning">Management</span>
          </h1>
          <p className="text-[10px] font-bold text-hijau">PC Persis Banjaran</p>
        </div>
      </div>

      {/* Menu Section */}
      <div
        className={`w-full mx-auto p-4 flex items-center justify-start mb-4 cursor-pointer ${
          activeMenu === "Dashboard" ? "bg-kuning rounded-l-full rounded-r-[100px] shadow-lg" : "bg-transparent"
        }`}
        onClick={() => handleMenuClick("Dashboard")}
      >
        <div className="flex items-center space-x-3">
          <FaTh
            className={`${
              activeMenu === "Dashboard" ? "text-white" : "text-gray-500"
            } text-sm`}
          />
          <span
            className={`${
              activeMenu === "Dashboard" ? "text-white" : "text-gray-500"
            } text-sm font-medium`}
          >
            Dashboard
          </span>
        </div>
      </div>

      <div
        className={`w-full mx-auto p-4 flex items-center justify-start mb-4 cursor-pointer ${
          activeMenu === "Pemetaan" ? "bg-kuning rounded-l-full rounded-r-[100px] shadow-lg" : "bg-transparent"
        }`}
        onClick={() => handleMenuClick("Pemetaan")}
      >
        <div className="flex items-center space-x-3">
          <FaMapMarkedAlt
            className={`${
              activeMenu === "Pemetaan" ? "text-white" : "text-gray-500"
            } text-sm`}
          />
          <span
            className={`${
              activeMenu === "Pemetaan" ? "text-white" : "text-gray-500"
            } text-sm font-medium`}
          >
            Pemetaan
          </span>
        </div>
      </div>

      <div
        className={`w-full mx-auto p-4 flex items-center justify-start mb-4 cursor-pointer ${
          activeMenu === "Sertifikasi" ? "bg-kuning rounded-l-full rounded-r-[100px] shadow-lg" : "bg-transparent"
        }`}
        onClick={() => handleMenuClick("Sertifikasi")}
      >
        <div className="flex items-center space-x-3">
          <FaCertificate
            className={`${
              activeMenu === "Sertifikasi" ? "text-white" : "text-gray-500"
            } text-sm`}
          />
          <span
            className={`${
              activeMenu === "Sertifikasi" ? "text-white" : "text-gray-500"
            } text-sm font-medium`}
          >
            Sertifikasi
          </span>
        </div>
      </div>

      {/* Logout Section */}
      <div
        className="w-full mx-auto p-4 flex items-center justify-start mt-auto cursor-pointer bg-transparent"
        onClick={handleLogout}
      >
        <div className="flex items-center space-x-3">
          <FaSignOutAlt className="text-gray-500 text-sm" />
          <span className="text-gray-500 text-sm font-medium">Logout</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
