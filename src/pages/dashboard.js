import React from "react";
import Sidebar from "../components/Sidebar";
import Layout from "../components/PageLayout";

const Dashboard = () => {
  return (
    <div className="relative">
      {/* Sidebar */}
      <div className="absolute top-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Layout */}
      <Layout>
        {/* Konten Utama */}
        <div className="flex-1 p-4">
        </div>
      </Layout>
    </div>
  );
};

export default Dashboard;
