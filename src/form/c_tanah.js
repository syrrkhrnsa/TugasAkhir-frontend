import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const CreateTanah = () => {
  const [namaTanah, setNamaTanah] = useState("");
  const [namaWakif, setNamaWakif] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [luasTanah, setLuasTanah] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk menambahkan data.");
      return;
    }

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/tanah",
        { NamaTanah: namaTanah, NamaWakif: namaWakif, lokasi, luasTanah },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      alert("Data berhasil ditambahkan!");
      navigate("/dashboard"); // Kembali ke dashboard setelah berhasil
    } catch (error) {
      console.error("Gagal menambahkan data:", error);
      alert("Terjadi kesalahan saat menambahkan data.");
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        {/* Container Form */}
        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[60%] max-w-3xl"
            style={{
              boxShadow:
                "0px 5px 15px rgba(0, 0, 0, 0.1), 0px -5px 15px rgba(0, 0, 0, 0.1), 5px 0px 15px rgba(0, 0, 0, 0.1), -5px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Judul */}
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Tanah</span>{" "}
              <span className="text-[#187556]">Baru</span>
            </h2>
            <p className="text-center text-gray-500">PC Persis Banjaran</p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid grid-cols-2 gap-8 justify-center">
                {/* Kolom kiri */}
                <div className="flex flex-col items-left">
                  <label className="block text-sm font-medium text-gray-400">
                    Nama Tanah
                  </label>
                  <input
                    type="text"
                    className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                    value={namaTanah}
                    onChange={(e) => setNamaTanah(e.target.value)}
                    required
                  />

                  <label className="block text-sm font-medium text-gray-400 mt-6">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                    value={lokasi}
                    onChange={(e) => setLokasi(e.target.value)}
                    required
                  />
                </div>

                {/* Kolom kanan */}
                <div className="flex flex-col items-left">
                  <label className="block text-sm font-medium text-gray-400">
                    Nama Wakif
                  </label>
                  <input
                    type="text"
                    className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                    value={namaWakif}
                    onChange={(e) => setNamaWakif(e.target.value)}
                    required
                  />

                  <label className="block text-sm font-medium text-gray-400 mt-6">
                    Luas Tanah
                  </label>
                  <input
                    type="text"
                    className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                    value={luasTanah}
                    onChange={(e) => setLuasTanah(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Tombol Simpan */}
              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default CreateTanah;
