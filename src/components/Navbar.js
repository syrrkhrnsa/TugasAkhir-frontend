import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="w-full bg-white fixed top-5 right-0 flex justify-end pr-20">
      <div className="max-w-7xl px-6 lg:px-8 flex justify-end items-center h-20 space-x-10">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `text-lg font-medium ${
              isActive ? "text-hijau border-b-2 border-kuning" : "text-hijau"
            } hover:text-green-600`
          }
        >
          Beranda
        </NavLink>
        <NavLink
          to="/lihat-data-wakaf"
          className={({ isActive }) =>
            `text-lg font-medium ${
              isActive ? "text-hijau border-b-2 border-kuning" : "text-hijau"
            } hover:text-green-600`
          }
        >
          Lihat Data Wakaf
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `text-lg font-medium ${
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

export default Navbar;