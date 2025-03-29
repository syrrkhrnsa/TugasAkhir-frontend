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
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Token tidak ditemukan! Silakan login terlebih dahulu.");
        setLoading(false);
        return;
      }

      try {
        // Fetch tanah data
        const tanahResponse = await axios.get(
          `http://127.0.0.1:8000/api/tanah/${idTanah}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!tanahResponse.data.data) {
          throw new Error("Data tanah tidak ditemukan");
        }

        setTanah(tanahResponse.data.data);

        // Fetch sertifikat data
        const sertifikatResponse = await axios.get(
          `http://127.0.0.1:8000/api/sertifikat/tanah/${idTanah}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSertifikatList(sertifikatResponse.data.data || []);
      } catch (error) {
        setError(
          error.response?.data?.message ||
            error.message ||
            "Terjadi kesalahan saat mengambil data"
        );
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idTanah]);

  const handlePreviewDokumen = (dokumenPath) => {
    if (dokumenPath) {
      // Construct full URL if the path is relative
      const fullUrl = dokumenPath.startsWith("http")
        ? dokumenPath
        : `http://127.0.0.1:8000/storage/${dokumenPath}`;
      window.open(fullUrl, "_blank");
    } else {
      alert("Dokumen tidak tersedia.");
    }
  };

  const calculateDayDifference = (dateString) => {
    if (!dateString) return "-";
    const today = new Date();
    const targetDate = new Date(dateString);
    const timeDifference = today - targetDate;
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return `${dayDifference} hari`;
  };

  if (loading) {
    return (
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="text-center py-10">Memuat data...</div>
        </div>
      </Sidebar>
    );
  }

  if (error) {
    return (
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="text-center py-10 text-red-500">{error}</div>
        </div>
      </Sidebar>
    );
  }

  if (!tanah) {
    return (
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="text-center py-10">Data tanah tidak ditemukan</div>
        </div>
      </Sidebar>
    );
  }

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

            {/* ID Tanah */}
            <div className="mt-2 text-center text-sm text-gray-500">
              ID Tanah: {tanah.id_tanah}
            </div>

            {/* Informasi Tanah */}
            <div className="mt-6 grid grid-cols-2 gap-x-24 justify-center">
              {/* Kolom kiri */}
              <div className="flex flex-col">
                <span className="text-md text-[#000] font-bold text-center mt-4">
                  Pimpinan Jamaah
                </span>
                <p className="mt-2 text-sm text-[#868686] font-semibold bg-gray-100 rounded-3xl text-center py-2 px-4">
                  {tanah.NamaPimpinanJamaah}
                </p>
                <span className="text-md text-[#000] font-bold text-center mt-4">
                  Lokasi
                </span>
                <p className="mt-2 text-sm text-[#868686] font-semibold bg-gray-100 rounded-3xl text-center py-2 px-4">
                  {tanah.lokasi}
                </p>
              </div>

              {/* Kolom kanan */}
              <div className="flex flex-col">
                <span className="text-md text-[#000] font-bold text-center mt-4">
                  Nama Wakif
                </span>
                <p className="mt-2 text-sm text-[#868686] font-semibold bg-gray-100 rounded-3xl text-center py-2 px-4">
                  {tanah.NamaWakif}
                </p>

                <span className="text-md text-[#000] font-bold text-center mt-4">
                  Luas Tanah
                </span>
                <p className="mt-2 text-sm text-[#868686] font-semibold bg-gray-100 rounded-3xl text-center py-2 px-4">
                  {tanah.luasTanah}
                </p>
              </div>
            </div>

            {/* Tabel Sertifikat */}
            <div className="mt-10">
              <h3 className="text-lg font-bold mb-4">Legalitas</h3>
              {sertifikatList.length > 0 ? (
                <table className="min-w-full text-xs bg-white border border-gray-300">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 font-medium border-b-2">No</th>
                      <th className="py-2 px-4 font-medium border-b-2">
                        ID Sertifikat
                      </th>
                      <th className="py-2 px-4 font-medium border-b-2">
                        Jenis Sertifikat
                      </th>
                      <th className="py-2 px-4 font-medium border-b-2">
                        No Dokumen
                      </th>
                      <th className="py-2 px-4 font-medium border-b-2">
                        Status
                      </th>
                      <th className="py-2 px-4 font-medium border-b-2">
                        Tanggal
                      </th>
                      <th className="py-2 px-4 font-medium border-b-2">
                        Dokumen
                      </th>
                      <th className="py-2 px-4 font-medium border-b-2">
                        Keterangan
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sertifikatList.map((sertifikat, index) => (
                      <tr key={sertifikat.id_sertifikat}>
                        <td className="py-2 px-4 border-b text-center">
                          {index + 1}
                        </td>
                        <td className="py-2 px-4 border-b text-center text-xs">
                          {sertifikat.id_sertifikat}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {sertifikat.jenis_sertifikat}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {sertifikat.no_dokumen || "-"}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <div
                            className={`inline-block px-8 py-2 rounded-[30px] ${
                              sertifikat.status === "disetujui"
                                ? "bg-[#AFFEB5] text-[#187556]"
                                : sertifikat.status === "ditolak"
                                ? "bg-[#FEC5D0] text-[#D80027]"
                                : "bg-[#FFEFBA] text-[#FECC23]"
                            }`}
                          >
                            {sertifikat.status}
                          </div>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {new Date(
                            sertifikat.tanggal_pengajuan
                          ).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          <button
                            onClick={() =>
                              handlePreviewDokumen(sertifikat.dokumen)
                            }
                            className="text-blue-500 hover:text-blue-700 flex items-center justify-center mx-auto"
                            disabled={!sertifikat.dokumen}
                          >
                            <FaEye />
                          </button>
                        </td>
                        <td className="py-2 px-4 border-b text-center">
                          {calculateDayDifference(sertifikat.tanggal_pengajuan)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Tidak ada data sertifikat untuk tanah ini.
                </div>
              )}
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default DetailTanah;
