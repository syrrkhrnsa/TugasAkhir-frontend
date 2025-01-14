import logo from "../assets/logo.png";
import { FaTh } from "react-icons/fa";
import React, { useState } from "react";

const Sidebar = () => {
  const [isActive, setIsActive] = useState(true);
  return (
    <div className="w-40 bg-white rounded-3xl shadow-2xl mx-auto my-8 p-6 ml-10">
      <div className="flex items-left">
        <img src={logo} alt="Logo" className="w-5 h-7 mt-7" />
        <div className="text-left">
          <h1 className="text-[9px] font-bold mt-8">
            <span className="text-hijau">Waqaf</span>{" "}
            <span className="text-kuning">Management</span>
          </h1>
          <p className="text-[9px] font-bold text-hijau">PC Persis Banjaran</p>
        </div>
      </div>

      {/* Menu Section */}
      <div
        className={`relative w-40 rounded-l-full rounded-r-[100px] shadow-lg mx-auto my-8 p-4 flex items-center justify-start ${
          isActive ? "bg-kuning" : "bg-white"
        }`}
        onClick={() => setIsActive(true)} // Set active saat diklik
      >
        <div className="flex items-center space-x-2">
          <FaTh
            className={`${
              isActive ? "text-white" : "text-gray-500"
            } text-[8px]`}
          />
          <span
            className={`${
              isActive ? "text-white" : "text-gray-500"
            } text-[8px]`}
          >
            Dashboard
          </span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
