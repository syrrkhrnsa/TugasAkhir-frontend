import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaEye } from "react-icons/fa";

const DetailTanah = () => {
  const { idTanah } = useParams();
  const [tanah, setTanah] = useState(null);
  const [sertifikatList, setSertifikatList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token tidak ditemukan! Silakan login terlebih dahulu.");
        return;
      }

      try {
        // Fetch data tanah
        const tanahResponse = await axios.get(
          `http://127.0.0.1:8000/api/tanah/${idTanah}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setTanah(tanahResponse.data.data); // Perhatikan: data tanah ada di `data.data`
        console.log("Data Tanah:", tanahResponse.data);

        // Fetch data sertifikat
        const sertifikatResponse = await axios.get(
          `http://127.0.0.1:8000/api/sertifikat/tanah/${idTanah}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setSertifikatList(sertifikatResponse.data.data); // Perhatikan: data sertifikat ada di `data.data`
        console.log("Data Sertifikat:", sertifikatResponse.data);
      } catch (error) {
        // console.error("Error fetching data:", error);
        // alert("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idTanah]);

  const handlePreviewDokumen = (dokumen) => {
    if (dokumen) {
      window.open(dokumen, "_blank");
    } else {
      alert("Dokumen tidak tersedia.");
    }
  };

  const calculateDayDifference = (dateString) => {
    const today = new Date(); // Tanggal hari ini
    const targetDate = new Date(dateString); // Tanggal dari data sertifikat
    const timeDifference = today - targetDate; // Selisih waktu dalam milidetik
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Konversi ke hari
    return `${dayDifference} hari`; // Format hasil
  };

  const dokumenTypes = [
    { key: "noDokumenBastw", label: "BASTW", docKey: "dokBastw" },
    { key: "noDokumenAIW", label: "AIW", docKey: "dokAiw" },
    { key: "noDokumenSW", label: "SW", docKey: "dokSw" },
  ];

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl"
            style={{
              boxShadow:
                "0px 5px 15px rgba(0, 0, 0, 0.1), 0px -5px 15px rgba(0, 0, 0, 0.1), 5px 0px 15px rgba(0, 0, 0, 0.1), -5px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Judul */}
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Detail</span>{" "}
              <span className="text-[#187556]">Tanah</span>
            </h2>
            <p className="text-center text-gray-500">PC Persis Banjaran</p>

            {loading ? (
              <p className="text-center text-gray-500 mt-6">Memuat data...</p>
            ) : (
              <>
                {/* Informasi Tanah */}
                <div className="mt-6 grid grid-cols-2 gap-x-24 justify-center">
                  {/* Kolom kiri */}
                  <div className="flex flex-col">
                    <span className="text-md text-[#000] font-bold text-center mt-4">
                      Pimpinan Jamaah
                    </span>
                    <p className="mt-2 text-sm text-[#868686] font-semibold bg-gray-100 rounded-3xl text-center py-2 px-4">
                      {tanah?.NamaPimpinanJamaah}
                    </p>
                    <span className="text-md text-[#000] font-bold text-center mt-4">
                      Lokasi
                    </span>
                    <p className="mt-2 text-sm text-[#868686] font-semibold bg-gray-100 rounded-3xl text-center py-2 px-4">
                      {tanah?.lokasi}
                    </p>
                  </div>

                  {/* Kolom kanan */}
                  <div className="flex flex-col">
                    <span className="text-md text-[#000] font-bold text-center mt-4">
                      Nama Wakif
                    </span>
                    <p className="mt-2 text-sm text-[#868686] font-semibold bg-gray-100 rounded-3xl text-center py-2 px-4">
                      {tanah?.NamaWakif}
                    </p>

                    <span className="text-md text-[#000] font-bold text-center mt-4">
                      Luas Tanah
                    </span>
                    <p className="mt-2 text-sm text-[#868686] font-semibold bg-gray-100 rounded-3xl text-center py-2 px-4">
                      {tanah?.luasTanah}
                    </p>
                  </div>
                </div>

                {/* Tabel Sertifikat */}
                <div className="mt-10">
                  <h3 className="text-lg font-bold mb-4">Legalitas</h3>
                  <table className="min-w-full text-xs bg-white border border-gray-300">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 font-medium border-b-2">No</th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          No Dokumen
                        </th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          Legalitas
                        </th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          Tanggal
                        </th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          Dokumen Legalitas
                        </th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          Keterangan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sertifikatList.length > 0 ? (
                        sertifikatList.map((sertifikat, index) =>
                          dokumenTypes.map(
                            (type, idx) =>
                              sertifikat[type.key] && (
                                <tr key={`${sertifikat.id_sertifikat}-${idx}`}>
                                  <td className="py-2 px-4 border-b text-center">
                                    {idx + 1}
                                  </td>
                                  <td className="py-2 px-4 border-b text-center">
                                    {sertifikat[type.key]}
                                  </td>
                                  <td className="py-2 px-4 border-b text-center">
                                    <div
                                      className={`inline-block px-8 py-2 rounded-[30px] ${
                                        sertifikat?.legalitas?.toLowerCase() ===
                                          "bastw terbit" ||
                                        sertifikat?.legalitas?.toLowerCase() ===
                                          "aiw terbit" ||
                                        sertifikat?.legalitas?.toLowerCase() ===
                                          "sertifikat terbit"
                                          ? "bg-[#AFFEB5] text-[#187556]"
                                          : sertifikat?.legalitas?.toLowerCase() ===
                                              "aiw ditolak" ||
                                            sertifikat?.legalitas?.toLowerCase() ===
                                              "sertifikat ditolak"
                                          ? "bg-[#FEC5D0] text-[#D80027]"
                                          : sertifikat?.legalitas
                                              ?.toLowerCase()
                                              .includes("proses")
                                          ? "bg-[#FFEFBA] text-[#FECC23]"
                                          : ""
                                      }`}
                                    >
                                      {sertifikat.legalitas}
                                    </div>
                                  </td>
                                  <td className="py-2 px-4 border-b text-center">
                                    {new Date(
                                      sertifikat.created_at
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="py-5 flex items-center justify-center">
                                    <button
                                      onClick={() =>
                                        handlePreviewDokumen(
                                          sertifikat[type.docKey]
                                        )
                                      }
                                      className="text-blue-500 hover:text-blue-700 flex items-center justify-center"
                                    >
                                      <FaEye />
                                    </button>
                                  </td>
                                  <td className="py-2 px-4 border-b text-center">
                                    {calculateDayDifference(
                                      sertifikat.created_at
                                    )}
                                  </td>
                                </tr>
                              )
                          )
                        )
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="py-2 px-4 border-b text-center"
                          >
                            Tidak ada data sertifikat.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default DetailTanah;
