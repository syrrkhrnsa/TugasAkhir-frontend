import { Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Approval = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="relative">
      {/* Layout */}
      <Sidebar>
        <div className="relative mb-4 flex justify-between items-center">
          <div className="ml-5">
            <h2 className="text-xl font-medium">Pesan Perubahan</h2>
            <p className="text-gray-500">PC Persis Banjaran</p>
          </div>
          <input
                type="text"
                placeholder="Cari"
                className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        
        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-6"
            style={{
              boxShadow:
                "0px 5px 15px rgba(0, 0, 0, 0.1), 0px -5px 15px rgba(0, 0, 0, 0.1), 5px 0px 15px rgba(0, 0, 0, 0.1), -5px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <ul className="divide-y divide-gray-300">
              <li className="flex justify-between items-center py-3">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">●</span>
                  <span className="font-medium">Pimpinan Jamaah A</span>
                </div>
                <span className="text-gray-600 text-sm">membuat data tanah wakaf</span>
                <div className="text-gray-500 text-sm">Yesterday &bull; 20:39</div>
              </li>
              <li className="flex justify-between items-center py-3">
                <div className="flex items-center">
                  <span className="font-medium">Pimpinan Jamaah B</span>
                </div>
                <span className="text-gray-600 text-sm">
                  melakukan perubahan terhadap tanah wakaf
                </span>
                <div className="text-gray-500 text-sm">Sun, Apr 12 &bull; 19:20</div>
              </li>
              <li className="flex justify-between items-center py-3">
                <div className="flex items-center">
                  <span className="font-medium">Pimpinan Jamaah A</span>
                </div>
                <span className="text-gray-600 text-sm">
                  melakukan perubahan terhadap tanah wakaf
                </span>
                <div className="text-gray-500 text-sm">Fri, Jan 30 &bull; 20:39</div>
              </li>
            </ul>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default Approval;