import { Bar } from "react-chartjs-2";
import Sidebar from "../components/Sidebar";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Log = () => {
  const [search, setSearch] = useState("");

  return (
    <div className="relative">
      {/* Layout */}
      <Sidebar>
        <div className="relative mb-4 flex justify-between items-center">
          <div className="ml-5">
            <h2 className="text-xl font-medium">Riwayat Tanah Wakaf</h2>
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
            <div className="container">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="px-4 py-2 text-left font-medium">No</th>
                    <th className="px-4 py-2 text-left font-medium">Penanggung Jawab</th>
                    <th className="px-4 py-2 text-left font-medium">Deskripsi Perubahan</th>
                    <th className="px-4 py-2 text-left font-medium">Stempel Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Dummy data rows can be added here */}
                  <tr className="border-b border-gray-300">
                    <td className="px-4 py-2">1</td>
                    <td className="px-4 py-2">Agista</td>
                    <td className="px-4 py-2">Perubahan status tanah</td>
                    <td className="px-4 py-2">2023-10-01 12:00</td>
                  </tr>
                  {/* Add more rows as needed */}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default Log;