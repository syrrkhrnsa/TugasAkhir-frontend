import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaPlus } from "react-icons/fa";

const Dashboard = () => {
  const [tanahList, setTanahList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  const navigate = useNavigate();
  const itemsPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token tidak ditemukan! Redirecting to login...");
      setError("Unauthorized: Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("http://127.0.0.1:8000/api/tanah", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Response dari API:", response.data);

      if (Array.isArray(response.data.data)) {
        setTanahList(response.data.data);
      } else {
        console.error("Data dari API bukan array:", response.data);
        setError("Data tidak valid");
      }

      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data tanah:", error);
      setError("Unauthorized: Token tidak valid atau sudah kedaluwarsa.");
      setLoading(false);
    }
  };

  const handleDelete = async (idTanah) => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.error("Token tidak ditemukan!");
      alert("Anda tidak memiliki izin untuk menghapus data ini.");
      return;
    }

    // Konfirmasi sebelum menghapus
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus data ini?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/tanah/${idTanah}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Perbarui state dengan menghapus item yang dihapus
      setTanahList((prevList) =>
        prevList.filter((tanah) => tanah.id_tanah !== idTanah)
      );

      alert("Data berhasil dihapus!");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const filteredTanah = tanahList.filter((tanah) =>
    tanah.NamaTanah.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedData = filteredTanah.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) {
      return [...Array(totalPages).keys()].map((n) => n + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, "...", totalPages - 1, totalPages];
    } else if (currentPage >= totalPages - 2) {
      return [
        1,
        2,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    } else {
      return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="relative mb-4 flex justify-between items-center">
          <div className="ml-5">
            <h2 className="text-lg font-medium">Tanah Wakaf</h2>
            <p className="text-gray-500 text-xs">PC Persis Banjaran</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari"
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className="bg-[#187556] text-white p-2 rounded-md hover:bg-[#146347]"
              onClick={() => navigate("/tanah/create")} // Navigasi ke halaman create tanah
            >
              <FaPlus />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-6"
            style={{
              boxShadow:
                "0px 5px 15px rgba(0, 0, 0, 0.1), 0px -5px 15px rgba(0, 0, 0, 0.1), 5px 0px 15px rgba(0, 0, 0, 0.1), -5px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="container">
              {loading ? (
                <p className="text-center text-gray-500 py-6">Memuat data...</p>
              ) : (
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="px-4 py-2 text-left font-medium">No</th>
                      <th className="px-4 py-2 text-left font-medium">
                        Nama Tanah
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Nama Wakif
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Lokasi
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Luas Tanah
                      </th>
                      <th className="px-4 py-2 text-centre font-medium">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((tanah, index) => (
                        <tr
                          key={tanah.id_tanah}
                          className="border-b border-gray-300"
                        >
                          <td className="text-xs px-4 py-4 whitespace-nowrap">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="text-xs px-4 py-4 whitespace-nowrap">
                            {tanah.NamaTanah}
                          </td>
                          <td className="text-xs px-4 py-4 whitespace-nowrap">
                            {tanah.NamaWakif}
                          </td>
                          <td className="text-xs px-4 py-4 whitespace-nowrap">
                            {tanah.lokasi}
                          </td>
                          <td className="text-xs px-4 py-4 whitespace-nowrap">
                            {tanah.luasTanah}
                          </td>
                          <td className="text-xs px-4 py-4 flex gap-3 justify-center">
                            <button
                              className="text-white px-4 py-2 rounded-md text-xs"
                              style={{ backgroundColor: "#187556" }}
                            >
                              Pemetaan
                            </button>
                            <button
                              className="text-white px-4 py-2 rounded-md text-xs"
                              style={{
                                backgroundColor: "#FECC23",
                                color: "#000",
                              }}
                            >
                              Sertifikat
                            </button>
                            <button
                              className="text-white px-4 py-2 rounded-md text-xs"
                              style={{ backgroundColor: "#99A0A7" }}
                              onClick={() =>
                                navigate(`/tanah/edit/${tanah.id_tanah}`)
                              }
                            >
                              Ubah
                            </button>
                            <button
                              onClick={() => handleDelete(tanah.id_tanah)} // Tambahkan aksi hapus di sini
                              className="text-white px-4 py-2 rounded-md text-xs"
                              style={{ backgroundColor: "#8A1D31" }}
                            >
                              Hapus
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-gray-500"
                        >
                          Data Tidak Tersedia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
              <div className="pagination flex justify-left space-x-1 mt-4">
                <button
                  className={`border border-gray-300 rounded-md px-3 py-1 ${
                    currentPage === 1 ? "text-gray-400 cursor-not-allowed" : ""
                  }`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span key={index} className="px-3 py-1">
                      {page}
                    </span>
                  ) : (
                    <button
                      key={index}
                      className={`border border-gray-300 rounded-md px-3 py-1 font-medium ${
                        currentPage === page ? "bg-gray-300" : ""
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className={`border border-gray-300 rounded-md px-3 py-1 ${
                    currentPage === totalPages
                      ? "text-gray-400 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default Dashboard;
