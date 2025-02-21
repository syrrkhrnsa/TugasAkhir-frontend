import React, { useState } from "react";
import { Link } from "@inertiajs/inertia-react";
import Sidebar from "../components/Sidebar";
import Layout from "../components/PageLayout";
import { useNavigate } from "react-router-dom";

const FormSertifikat = () => {
  const navigate = useNavigate();
  
  // State untuk status dan warna
  const [statusText, setStatusText] = useState("");
  const [statusColor, setStatusColor] = useState("#000000"); // Default hitam
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Palet warna
  const colors = [
    "#FF5733", "#33FF57", "#3357FF", "#FFD700", "#800080",
    "#FF1493", "#00CED1", "#FF4500", "#8B4513"
  ];

  // Simpan status dan warna
  const handleSaveStatus = () => {
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="absolute top-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Layout */}
      <Layout>
        {/* Konten Utama */}
        <div className="flex flex-col items-center justify-center h-full p-6">
          <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
            <h2 className="text-2xl font-bold text-green-700 mb-4 text-center">
              Sertifikat <span className="text-[#FECC23]">Tanah</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No Sertifikat</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Dapat di isi jika sertifikat sudah berstatus tersertifikasi. Jika belum, maka kosongkan saja.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Wakif</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kode Tanah</label>
                <select className="w-full border border-gray-300 rounded-md p-2">
                  <option value="">Pilih...</option>
                  <option value="1">Kode Tanah 1</option>
                  <option value="2">Kode Tanah 2</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Luas Tanah</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fasilitas</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2" />
                <p className="text-xs text-gray-500 mt-1">
                  Fasilitas berdasarkan kode tanah.
                </p>
              </div>

              {/* Field Status */}
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <button
                  className="w-full border border-gray-300 rounded-md p-2 flex items-center justify-between"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  style={{ backgroundColor: statusColor, color: "#FFFFFF", fontWeight: "bold" }}
                >
                  {statusText || "Pilih Status"}
                  <span className="ml-2">&#9660;</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full p-3 shadow-lg">
                    <input
                      type="text"
                      placeholder="Masukkan status"
                      className="w-full border border-gray-300 rounded-md p-2 mb-2"
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                    />
                    <div className="grid grid-cols-3 gap-2 mb-2">
                      {colors.map((color, index) => (
                        <button
                          key={index}
                          className="w-full h-8 rounded-md border"
                          style={{ backgroundColor: color }}
                          onClick={() => setStatusColor(color)}
                        />
                      ))}
                    </div>
                    <button
                      onClick={handleSaveStatus}
                      className="w-full bg-blue-500 text-white px-4 py-2 rounded-md"
                    >
                      Simpan
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => navigate("/sertifikat")}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
              >
                Kembali
              </button>
              <button className="bg-[#549AEA] text-white px-4 py-2 rounded-md">Simpan</button>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default FormSertifikat;
