import React from "react";
import Sidebar from "../components/Sidebar";

const Dashboard = () => {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Navbar dengan Logo */}
      <div className="flex items-center justify-between px-10 py-4">
        <Sidebar />
      </div>
    </div>
  );
};

export default Dashboard;
