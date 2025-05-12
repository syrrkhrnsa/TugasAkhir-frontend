import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import PublicPetaTanah from "../public/PemetaanPublic";
import PublicTanah from "../public/TanahPublic";
import {
  TbMap,
  TbLayoutGrid,
  TbBuildingWarehouse,
  TbHome,
} from "react-icons/tb";
import logo from "../assets/logo.png";

const PetaTanahPage = () => {
  const [activeTab, setActiveTab] = useState("pemetaan");

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        {/* Combined Header with Logo and Tabs in one line */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <img src={logo} alt="Logo" className="w-10 h-12" />
            <div className="text-left ml-4">
              <h1 className="text-[14px] font-bold">
                <span className="text-hijau">Waqf</span>{" "}
                <span className="text-kuning">Management</span>
              </h1>
              <p className="text-[12px] font-bold text-hijau">
                PC Persis Banjaran
              </p>
            </div>
          </div>

          {/* Tabs aligned with logo */}
          <div className="flex items-center space-x-1">
            <NavLink
              to="/"
              className="flex items-center py-2 px-4 text-sm rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <TbHome className="mr-1" size={16} />
              Beranda
            </NavLink>

            <button
              onClick={() => setActiveTab("pemetaan")}
              className={`flex items-center py-2 px-4 text-sm rounded-lg transition-colors ${
                activeTab === "pemetaan"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <TbMap className="mr-1" size={16} />
              Pemetaan
            </button>

            <button
              onClick={() => setActiveTab("tanah")}
              className={`flex items-center py-2 px-4 text-sm rounded-lg transition-colors ${
                activeTab === "tanah"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <TbLayoutGrid className="mr-1" size={16} />
              Tanah
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "pemetaan" && <PublicPetaTanah />}
          {activeTab === "tanah" && <PublicTanah />}
        </div>
      </div>
    </div>
  );
};

export default PetaTanahPage;
