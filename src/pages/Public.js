import React, { useState } from "react";
import PublicPetaTanah from "../public/PemetaanPublic";
import PublicTanah from "../public/TanahPublic";
import NavbarLanding from "../components/NavbarLanding";
import landingphoto from "../assets/landing.png";
import { TbMap, TbLayoutGrid, TbBuildingWarehouse } from "react-icons/tb";

const PetaTanahPage = () => {
  const [activeTab, setActiveTab] = useState("pemetaan");

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex justify-center items-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-center">
            <span className="text-kuning">PC</span>{" "}
            <span className="text-hijau">Persis Banjaran</span>
          </h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`flex items-center py-3 px-6 font-medium text-sm rounded-t-lg mr-2 ${
              activeTab === "pemetaan"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("pemetaan")}
          >
            <TbMap className="mr-2" size={18} />
            Pemetaan
          </button>

          <button
            className={`flex items-center py-3 px-6 font-medium text-sm rounded-t-lg mr-2 ${
              activeTab === "tanah"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("tanah")}
          >
            <TbLayoutGrid className="mr-2" size={18} />
            Data Tanah
          </button>

          <button
            className={`flex items-center py-3 px-6 font-medium text-sm rounded-t-lg ${
              activeTab === "fasilitas"
                ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab("fasilitas")}
          >
            <TbBuildingWarehouse className="mr-2" size={18} />
            Data Fasilitas
          </button>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === "pemetaan" && (
            <div className="animate-fadeIn">
              <PublicPetaTanah />
            </div>
          )}

          {activeTab === "tanah" && (
            <div className="animate-fadeIn p-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                {/* Placeholder for tanah data table */}
                <p className="text-gray-500">
                  <PublicTanah />
                </p>
              </div>
            </div>
          )}

          {activeTab === "fasilitas" && (
            <div className="animate-fadeIn p-4">
              <h2 className="text-xl font-bold mb-4">Data Fasilitas</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                {/* Placeholder for fasilitas data table */}
                <p className="text-gray-500">
                  Data fasilitas akan ditampilkan di sini
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetaTanahPage;
