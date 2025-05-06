import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaMap } from "react-icons/fa";

const PublicDataTanah = () => {
  // State management
  const [tanahData, setTanahData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();

  // Fetch data
  const fetchData = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/api/tanah/public"
      );
      setTanahData(response.data.data || []);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setError("Gagal memuat data tanah");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Search and pagination
  const filteredData = useMemo(() => {
    return tanahData.filter(
      (item) =>
        (item.NamaPimpinanJamaah?.toLowerCase() || "").includes(
          search.toLowerCase()
        ) ||
        (item.NamaWakif?.toLowerCase() || "").includes(search.toLowerCase()) ||
        (item.lokasi?.toLowerCase() || "").includes(search.toLowerCase())
    );
  }, [tanahData, search]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // UI helpers
  const getStatusStyle = (status) => {
    switch (status) {
      case "disetujui":
        return "bg-[#AFFEB5] text-[#187556]";
      default:
        return "bg-[#FFEFBA] text-[#FECC23]";
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - half);
      let end = Math.min(totalPages, currentPage + half);

      if (currentPage <= half + 1) end = maxVisiblePages;
      if (currentPage >= totalPages - half)
        start = totalPages - maxVisiblePages + 1;

      if (start > 1) pages.push(1, "...");
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages) pages.push("...", totalPages);
    }

    return pages;
  };

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="relative mb-4 flex justify-between items-center p-4 bg-white shadow-sm rounded-lg">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Data Tanah Wakaf
          </h2>
          <p className="text-sm text-gray-500">PC Persis Banjaran</p>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="text"
            placeholder="Cari data tanah..."
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#187556] focus:border-transparent"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#187556]"></div>
            <p className="mt-2 text-gray-600">Memuat data tanah...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
            >
              Coba Lagi
            </button>
          </div>
        ) : (
          <>
            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pimpinan Jamaah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Wakif
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Luas Tanah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Legalitas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={item.id_tanah} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.NamaPimpinanJamaah || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.NamaWakif || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate hover:max-w-none hover:whitespace-normal">
                          {item.lokasi || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.luasTanah
                            ? `${item.luasTanah.replace(
                                /\B(?=(\d{3})+(?!\d))/g,
                                "."
                              )} m²`
                            : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div
                              className={`inline-block px-4 py-2 rounded-[30px] ${
                                item.legalitas === "SW"
                                  ? "bg-[#AFFEB5] text-[#187556]"
                                  : item.legalitas === "AIW"
                                  ? "bg-[#acdfff] text-[#3175f3]"
                                  : "bg-[#FFEFBA] text-[#ffc400]"
                              }`}
                            >
                              {item.legalitas || "-"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              navigate(`/detail/tanah/public/${item.id_tanah}`)
                            }
                            className="p-1 text-gray-400 hover:text-gray-600"
                            title="Detail"
                          >
                            <FaEye />
                          </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-4 text-center text-sm text-gray-500"
                      >
                        Tidak ada data yang ditemukan
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Menampilkan{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>{" "}
                    sampai{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * itemsPerPage,
                        filteredData.length
                      )}
                    </span>{" "}
                    dari{" "}
                    <span className="font-medium">{filteredData.length}</span>{" "}
                    hasil
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === 1
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Sebelumnya
                    </button>
                    {getPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <span key={index} className="px-3 py-1 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <button
                          key={index}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === page
                              ? "bg-[#187556] text-white"
                              : "bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === totalPages
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      Selanjutnya
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PublicDataTanah;
