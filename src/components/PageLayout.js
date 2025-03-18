import React from "react";
import user from "../assets/profile.png";
import { FaBell } from "react-icons/fa";
import message from "../assets/icon.png";
import { getUserName } from "../utils/Auth";

const Layout = ({ children }) => {
  const userName = getUserName() || "User";

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="bg-white w-48 border-r"></div>

      {/* Main Content */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <header className="bg-white border-b px-10 py-4 flex justify-between items-center">
          <h1 className="text-lg font-bold text-gray-700"></h1>
          <div className="flex items-center gap-4">
            {/* Notifikasi */}
            <img
              src={message}
              alt="Message"
              className="w-full h-full object-cover"
            />

            <span className="text-yellow-500 font-semibold">Hi,</span>
            <span className="text-green-600 font-semibold">{userName}!</span>
            <div className="w-8 h-8 overflow-hidden rounded-full">
              <img
                src={user}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gray-200 overflow-y-auto p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t px-10 py-4 text-center text-gray-600">
          © 2025 PC Persis Banjaran
        </footer>
      </div>
    </div>
  );
};

export default Layout;
