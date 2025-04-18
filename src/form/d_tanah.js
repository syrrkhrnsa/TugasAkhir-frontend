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
        try {
          const sertifikatResponse = await axios.get(
            `http://127.0.0.1:8000/api/sertifikat/tanah/${idTanah}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          setSertifikatList(sertifikatResponse.data.data || []);
        } catch (sertifikatError) {
          console.error("Error fetching sertifikat:", sertifikatError);
          setSertifikatList([]);
        }
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
            className="bg-white shadow-lg rounded-xl p-6 mx-auto w-full max-w-6xl"
            style={{
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Header Section */}
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800">
                <span className="text-[#FECC23]">Detail</span>{" "}
                <span className="text-[#187556]">Tanah</span>
              </h2>
              <p className="text-sm text-gray-500 mt-1">PC Persis Banjaran</p>
            </div>

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left Column - Property Details */}
              <div className="w-full lg:w-2/5">
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Pimpinan Jamaah
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {tanah.NamaPimpinanJamaah || "-"}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Lokasi
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {tanah.lokasi || "-"}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Nama Wakif
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {tanah.NamaWakif || "-"}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      Luas Tanah
                    </div>
                    <div className="text-sm font-medium text-gray-700">
                      {tanah.luasTanah
                        ? `${Number(tanah.luasTanah).toLocaleString(
                            "id-ID"
                          )} m²`
                        : "-"}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Jenis Tanah
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {tanah.jenis_tanah || "-"}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Batas-Batas Tanah
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Timur:</span>{" "}
                      {tanah.batas_timur || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Selatan:</span>{" "}
                      {tanah.batas_selatan || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Barat:</span>{" "}
                      {tanah.batas_barat || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Utara:</span>{" "}
                      {tanah.batas_utara || "-"}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Ukuran Tanah
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    <div>
                      <span className="font-medium">Panjang:</span>{" "}
                      {tanah.panjang_tanah || "-"}
                    </div>
                    <div>
                      <span className="font-medium">Lebar:</span>{" "}
                      {tanah.lebar_tanah || "-"}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Alamat Wakif
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {tanah.alamat_wakif || "-"}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Catatan
                  </div>
                  <div className="text-sm font-medium text-gray-700">
                    {tanah.catatan || "-"}
                  </div>
                </div>
              </div>

              {/* Right Column - Legalitas Table */}
              <div className="w-full lg:w-3/5">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            No Dokumen
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Legalitas
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Dokumen
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Keterangan
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sertifikatList.length > 0 ? (
                          sertifikatList.map((sertifikat, index) => (
                            <tr key={sertifikat.id_sertifikat}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {sertifikat.no_dokumen || "-"}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-700">
                                {sertifikat.jenis_sertifikat}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    sertifikat.status === "disetujui"
                                      ? "bg-green-100 text-green-800"
                                      : sertifikat.status === "ditolak"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {sertifikat.status}
                                </span>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={() =>
                                    handlePreviewDokumen(sertifikat.dokumen)
                                  }
                                  className="text-blue-500 hover:text-blue-700"
                                  disabled={!sertifikat.dokumen}
                                >
                                  <FaEye className="inline" />
                                </button>
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {calculateDayDifference(
                                  sertifikat.tanggal_pengajuan
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-3 py-4 text-center text-sm text-gray-500"
                            >
                              Belum ada data sertifikat untuk tanah ini
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default DetailTanah;
