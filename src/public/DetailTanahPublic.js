import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaArrowLeft, FaMapMarkerAlt, FaRulerCombined, FaFileAlt, FaUser } from "react-icons/fa";

const DetailTanahPublic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tanah, setTanah] = useState(null);
  const [sertifikatList, setSertifikatList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tanah data
        const tanahResponse = await axios.get(
          `http://127.0.0.1:8000/api/tanah/public/${id}`
        );

        if (!tanahResponse.data.data) {
          throw new Error("Data tanah tidak ditemukan");
        }

        setTanah(tanahResponse.data.data);

        // Fetch sertifikat data
        try {
          const sertifikatResponse = await axios.get(
            `http://127.0.0.1:8000/api/sertifikat/public/tanah/${id}`
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
  }, [id]);

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
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#187556]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!tanah) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <p className="text-gray-500 mb-4">Data tanah tidak ditemukan</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <FaArrowLeft className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            <span className="text-[#FECC23]">Detail</span>{" "}
            <span className="text-[#187556]">Tanah Wakaf</span>
          </h1>
          <p className="text-sm text-gray-500">PC Persis Banjaran</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Status Bar */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div>
            <span className="text-sm font-medium text-gray-500">Status:</span>
            <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
              tanah.legalitas === "SW" 
                ? "bg-[#AFFEB5] text-[#187556]" 
                : tanah.legalitas === "AIW" 
                ? "bg-[#acdfff] text-[#3175f3]" 
                : "bg-[#FFEFBA] text-[#ffc400]"
            }`}>
              {tanah.legalitas || "-"}
            </span>
          </div>
        </div>

        {/* Detail Sections */}
        <div className="flex flex-col lg:flex-row gap-6 p-6">
          {/* Left Column - Property Details */}
          <div className="w-full lg:w-2/5 space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <FaUser className="text-[#187556] mr-2" />
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Pimpinan Jamaah
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {tanah.NamaPimpinanJamaah || "-"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <FaMapMarkerAlt className="text-[#187556] mr-2" />
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Lokasi
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {tanah.lokasi || "-"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <FaUser className="text-[#187556] mr-2" />
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Nama Wakif
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {tanah.NamaWakif || "-"}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <FaRulerCombined className="text-[#187556] mr-2" />
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Luas Tanah
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {tanah.luasTanah
                  ? `${Number(tanah.luasTanah).toLocaleString("id-ID")} m²`
                  : "-"}
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

            {/* Additional Information */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-100">
              <div className="flex items-center mb-2">
                <FaFileAlt className="text-[#187556] mr-2" />
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Keterangan Tambahan
                </div>
              </div>
              <div className="text-sm font-medium text-gray-700">
                {tanah.catatan || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailTanahPublic;