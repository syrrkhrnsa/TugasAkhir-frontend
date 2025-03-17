import React from "react";
import { Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";

const Pemetaan = () => {
  // Dummy data for the bar chart
  return (
    <div className="relative">
      {/* Layout */}
      <Sidebar>
        <div className="relative mb-4 flex justify-between items-center">
          <div className="ml-5">
            <h2 className="text-xl font-medium">Pemetaan Geospasial</h2>
            <p className="text-gray-500">PC Persis Banjaran</p>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default Pemetaan;