import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const EditTanah = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();

  const [NamaPimpinanJamaah, setNamaPimpinanJamaah] = useState("");
  const [NamaWakif, setNamaWakif] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [luasTanah, setLuasTanah] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTanah();
  }, []);

  const fetchTanah = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk mengedit data.");
      navigate("/dashboard");
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/tanah/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Response dari API:", response.data); // Cek response di console

      // Periksa struktur response, bisa jadi datanya ada di response.data.data
      const tanah = response.data.data || response.data;

      if (tanah) {
        setNamaPimpinanJamaah(tanah.NamaPimpinanJamaah || "");
        setNamaWakif(tanah.NamaWakif || "");
        setLokasi(tanah.lokasi || "");
        setLuasTanah(tanah.luasTanah || "");
      }
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data tanah:", error);
      alert("Gagal mengambil data tanah.");
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk mengedit data.");
      return;
    }

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/tanah/${id}`,
        { NamaPimpinanJamaah, NamaWakif, lokasi, luasTanah },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      // Perbarui state tanahList di localStorage
      const storedTanahList =
        JSON.parse(localStorage.getItem("tanahList")) || [];
      const updatedTanahList = storedTanahList.map((tanah) =>
        tanah.id_tanah === id
          ? {
              ...tanah,
              NamaPimpinanJamaah,
              NamaWakif,
              lokasi,
              luasTanah,
            }
          : tanah
      );

      localStorage.setItem("tanahList", JSON.stringify(updatedTanahList));

      alert("Data berhasil diperbarui!");
      navigate("/dashboard"); // Kembali ke dashboard tanpa reload API
    } catch (error) {
      console.error("Gagal memperbarui data:", error);
      alert("Terjadi kesalahan saat memperbarui data.");
    }
  };

  return (
    <div className="relative">
      <Sidebar>
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
              <span className="text-[#FECC23]">Edit</span>{" "}
              <span className="text-[#187556]">Tanah</span>
            </h2>
            <p className="text-center text-gray-500">PC Persis Banjaran</p>

            {loading ? (
              <p className="text-center text-gray-500 mt-6">Memuat data...</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="grid grid-cols-2 gap-8 justify-center">
                  {/* Kolom kiri */}
                  <div className="flex flex-col items-left">
                    <label className="block text-sm font-medium text-gray-400">
                      Pimpinan Jamaah
                    </label>
                    <input
                      type="text"
                      className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                      value={NamaPimpinanJamaah}
                      onChange={(e) => setNamaPimpinanJamaah(e.target.value)}
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
                      value={NamaWakif}
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
            )}
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default EditTanah;
