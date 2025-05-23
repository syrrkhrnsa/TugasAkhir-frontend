import React from "react";
import { NavLink } from "react-router-dom";
import logo from '../assets/logo.png'; // Ganti dengan path logo Anda

const NavbarLanding = () => {
  return (
    <nav className="w-full bg-white flex justify-between items-center px-20 relative z-10">
      {/* Logo dan Teks di sebelah kiri */}
      <div className="flex items-center">
        <img src={logo} alt="Logo" className="h-10 mt-5" />
        <div className="text-left ml-2">
          <h1 className="text-[14px] font-bold mt-4">
            <span className="text-hijau">Waqf</span>{" "}
            <span className="text-kuning">Management</span>
          </h1>
          <p className="text-[12px] font-bold text-hijau">PC Persis Banjaran</p>
        </div>
      </div>
      
      {/* Navigasi di sebelah kanan */}
      <div className="flex justify-end items-center space-x-8">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-xl font-medium ${
              isActive ? "text-hijau border-b-2 border-kuning" : "text-hijau"
            } hover:text-green-600`
          }
        >
          Beranda
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `text-xl font-medium ${
              isActive ? "text-hijau border-b-2 border-kuning" : "text-hijau"
            } hover:text-green-600`
          }
        >
          Masuk
        </NavLink>
      </div>
    </nav>
  );
};

export default NavbarLanding;