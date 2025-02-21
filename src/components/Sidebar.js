import logo from "../assets/logo.png";
import {
  FaTh,
  FaMapMarkedAlt,
  FaCertificate,
  FaSignOutAlt,
} from "react-icons/fa";
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Ambil path saat ini

  // Tentukan activeMenu berdasarkan pathname
  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <FaTh /> },
    { name: "Pemetaan", path: "/pemetaan", icon: <FaMapMarkedAlt /> },
    { name: "Sertifikasi", path: "/sertifikat", icon: <FaCertificate /> },
  ];

  return (
    <div className="w-48 bg-white rounded-3xl shadow-[0px_-10px_20px_rgba(0,0,0,0.1),0px_10px_20px_rgba(0,0,0,0.1)] mx-4 my-8 py-6 flex flex-col h-[90vh]">
      {/* Logo Section */}
      <div className="flex items-left mb-6 ml-7">
        <img src={logo} alt="Logo" className="w-6 h-8 mt-4" />
        <div className="text-left ml-2">
          <h1 className="text-[11px] font-bold mt-4">
            <span className="text-hijau">Waqaf</span>{" "}
            <span className="text-kuning">Management</span>
          </h1>
          <p className="text-[10px] font-bold text-hijau">PC Persis Banjaran</p>
        </div>
      </div>

      {/* Menu Section */}
      {menuItems.map((menu) => {
        const isActive = location.pathname === menu.path;
        return (
          <div
            key={menu.name}
            className={`w-full mx-auto p-4 flex items-center mb-4 cursor-pointer ${
              isActive ? "bg-kuning rounded-l-full rounded-r-[100px] shadow-lg" : "bg-transparent"
            }`}
            onClick={() => navigate(menu.path)}
          >
            <div className="flex items-center ml-7 space-x-3">
              {React.cloneElement(menu.icon, {
                className: isActive ? "text-white text-sm" : "text-gray-500 text-sm",
              })}
              <span className={isActive ? "text-white text-sm font-medium" : "text-gray-500 text-sm font-medium"}>
                {menu.name}
              </span>
            </div>
          </div>
        );
      })}

      {/* Logout Section */}
      <div
        className="w-full mx-auto p-4 flex items-center mt-auto cursor-pointer bg-transparent"
        onClick={() => navigate("/login")}
      >
        <div className="flex items-center ml-7 space-x-3">
          <FaSignOutAlt className="text-gray-500 text-sm" />
          <span className="text-gray-500 text-sm font-medium">Keluar</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
