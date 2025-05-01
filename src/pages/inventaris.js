import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaPlus, FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";

const ListInventaris = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // State untuk data inventaris
  const [inventarisData, setInventarisData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State untuk search dan pagination
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch data inventaris dari API
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: Silakan login terlebih dahulu.");
        setLoading(false);
        return;
      }
  
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/inventaris/fasilitas/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Handle both response formats
        const data = response.data.data || response.data;
        setInventarisData(data || []);
        
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        
        let errorMessage = "Gagal memuat data inventaris";
        if (error.response) {
          if (error.response.status === 404) {
            // If 404, treat as empty inventory
            setInventarisData([]);
            return;
          } else if (error.response.status === 500) {
            errorMessage = "Server error - silakan coba lagi nanti";
          }
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
  
    fetchData();
  }, [id]);

  // Handle delete inventaris
  const handleDelete = async (idInventaris) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data inventaris yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    try {
      await axios.delete(`http://127.0.0.1:8000/api/inventaris/${idInventaris}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInventarisData(prev => prev.filter(item => item.id_inventaris !== idInventaris));
      Swal.fire("Berhasil!", "Data inventaris telah dihapus.", "success");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
    }
  };

  // Filter data berdasarkan search
  const filteredData = inventarisData.filter(item =>
    item.nama_barang.toLowerCase().includes(search.toLowerCase()) ||
    item.kode_barang?.toLowerCase().includes(search.toLowerCase()) ||
    item.kondisi.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  // Helper untuk kondisi inventaris
  const getKondisiStyle = (kondisi) => {
    switch (kondisi) {
      case "baik":
        return "bg-green-100 text-green-800";
      case "rusak_ringan":
        return "bg-yellow-100 text-yellow-800";
      case "rusak_berat":
        return "bg-orange-100 text-orange-800";
      case "hilang":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        {/* Header Section */}
        <div className="relative mb-4 flex justify-between items-center p-4 bg-white shadow-sm rounded-lg">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)} // Kembali ke halaman sebelumnya
              className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              title="Kembali"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              Daftar Inventaris
              <p className="text-sm text-gray-500 font-normal">PC Persis Banjaran</p>
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="text"
              placeholder="Cari inventaris..."
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#187556] focus:border-transparent"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />

            <button
              className="p-2 text-white bg-[#187556] rounded-md hover:bg-[#146347] transition-colors"
              onClick={() => navigate(`/inventaris/create/${id}`)}
              title="Tambah Inventaris"
            >
              <FaPlus />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#187556]"></div>
                <p className="mt-2 text-gray-600">Memuat data inventaris...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
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
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nama Barang
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kode Barang
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Satuan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kondisi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedData.length > 0 ? (
                        paginatedData.map((item, index) => (
                          <tr key={item.id_inventaris} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.nama_barang}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.kode_barang || "-"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.jumlah}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.satuan}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getKondisiStyle(
                                  item.kondisi
                                )}`}
                              >
                                {item.kondisi.replace(/_/g, " ")}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    navigate(`/inventaris/edit/${item.id_inventaris}`)
                                  }
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Edit"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id_inventaris)}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                  title="Hapus"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-6 py-4 text-center text-sm text-gray-500"
                          >
                            Data Inventaris Belum Tersedia
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
                        <span className="font-medium">
                          {filteredData.length}
                        </span>{" "}
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
                            <span
                              key={index}
                              className="px-3 py-1 text-gray-500"
                            >
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
      </Sidebar>
    </div>
  );
};

export default ListInventaris;