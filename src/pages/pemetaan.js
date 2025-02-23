import React from "react";
import Sidebar from "../components/Sidebar";
import Layout from "../components/PageLayout";

const Pemetaan = () => {
  return (
    <div className="relative">
      {/* Sidebar */}
      <div className="absolute top-0 left-0 z-50">
        <Sidebar />
      </div>
    </div>
  );
};

export default Pemetaan;
