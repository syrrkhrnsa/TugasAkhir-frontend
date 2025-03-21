import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaPlus, FaMap, FaEdit, FaTrash, FaHistory } from "react-icons/fa"; // Importing icons
import { getUserId, getRoleId } from "../utils/Auth";

const Legalitas = () => {
  const [dataList, setDataList] = useState([]); // Mengganti tanahList menjadi dataList
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  const navigate = useNavigate();
  const itemsPerPage = 5;

  const roleId = getRoleId();
  const isPimpinanJamaah = roleId === "326f0dde-2851-4e47-ac5a-de6923447317";

  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    console.log(roleId);
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
      // Ambil data dari API tanah
      const tanahResponse = await axios.get("http://127.0.0.1:8000/api/tanah/", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Ambil data dari API approval
      const approvalResponse = await axios.get("http://127.0.0.1:8000/api/approvals/type/tanah", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      console.log("Response dari API tanah:", tanahResponse.data);
      console.log("Response dari API approval:", approvalResponse.data);

      // Gabungkan data dari kedua API
      const combinedData = [
        ...(Array.isArray(tanahResponse.data.data) ? tanahResponse.data.data : []),
        ...(Array.isArray(approvalResponse.data.data) ? approvalResponse.data.data : []),
      ];

      setDataList(combinedData); // Set data gabungan ke state
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setError("Unauthorized: Token tidak valid atau sudah kedaluwarsa.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
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
      // Coba hapus dari API tanah
      await axios.delete(`http://127.0.0.1:8000/api/tanah/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      // Perbarui state dengan menghapus item yang dihapus
      setDataList((prevList) =>
        prevList.filter((item) => item.id_tanah !== id && item.id !== id)
      );

      alert("Data berhasil dihapus!");
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      alert("Terjadi kesalahan saat menghapus data.");
    }
  };

  const filteredData = dataList.filter((item) => {
    try {
      console.info(item)
      const pimpinanJamaah = item?.NamaPimpinanJamaah || item?.pimpinan_jamaah || "";
      return pimpinanJamaah.toLowerCase().includes(search.toLowerCase());
    } catch (e) {
      console.error("Failed to parse item data:", e);
    }
    return[]
  });
  

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
      {/* Layout */}
      <Sidebar>
        <div className="relative mb-4 flex justify-between items-center">
          <div className="ml-5">
            <h2 className="text-xl font-medium">Legalitas Tanah Wakaf</h2>
            <p className="text-gray-500">PC Persis Banjaran</p>
          </div>

          <div className="flex gap-2 items-center">
            <button
              className="text-white p-2 rounded-md text-xs"
              style={{ backgroundColor: "#2C3E50" }}
              onClick={() => navigate(`/riwayat/tanah`)}
            >
              <FaHistory />
            </button>
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
                        Pimpinan Jamaah
                      </th>
                      <th className="px-4 py-2 text-center font-medium">
                        Nama Wakif
                      </th>
                      <th className="px-4 py-2 text-center font-medium">
                        Lokasi
                      </th>
                      <th className="px-4 py-2 text-center font-medium">
                        Luas Tanah
                      </th>
                      {isPimpinanJamaah && (
                        <th className="px-4 py-2 text-center font-medium">
                          Status
                        </th>
                      )}
                      <th className="px-4 py-2 text-center font-medium">
                        Legalitas
                      </th>
                      <th className="px-4 py-2 text-center font-medium">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item, index) => (
                        <tr
                          key={item.id_tanah || item.id}
                          className="border-b border-gray-300"
                        >
                          <td className="text-sm px-4 py-4 whitespace-nowrap font-semibold">
                            {(currentPage - 1) * itemsPerPage + index + 1}
                          </td>
                          <td className="text-sm text-center px-4 py-4 whitespace-nowrap font-semibold">
                            {item.NamaPimpinanJamaah || item.pimpinan_jamaah}
                          </td>
                          <td className="text-sm text-center px-4 py-4 whitespace-nowrap font-semibold">
                            {item.NamaWakif || item.nama_wakif}
                          </td>
                          <td className="text-sm text-center px-4 py-4 whitespace-nowrap font-semibold">
                            {item.lokasi || item.lokasi_tanah}
                          </td>
                          <td className="text-sm text-center px-4 py-4 whitespace-nowrap font-semibold">
                            {item.luasTanah || item.luas_tanah}
                          </td>
                          <td className="text-sm text-center px-4 py-2 whitespace-nowrap font-semibold">
                            <div
                              className={`inline-block px-4 py-2 rounded-[30px] ${
                                item?.status?.toLowerCase() === "disetujui"
                                  ? "bg-[#AFFEB5] text-[#187556]"
                                  : item?.status?.toLowerCase() === "ditolak"
                                  ? "bg-[#FEC5D0] text-[#D80027]"
                                  : item?.status?.toLowerCase() === "ditinjau"
                                  ? "bg-[#FFEFBA] text-[#FECC23]"
                                  : ""
                              }`}
                            >
                              {item.status}
                            </div>
                          </td>
                          {isPimpinanJamaah ? (
                            <td className="text-sm text-center px-4 py-2 whitespace-nowrap font-semibold">
                              <div
                                className={`inline-block px-4 py-2 rounded-[30px] ${
                                  item?.legalitas?.toLowerCase().includes("terbit")
                                    ? "bg-[#AFFEB5] text-[#187556]"
                                    : item?.legalitas?.toLowerCase().includes("ditolak")
                                    ? "bg-[#FEC5D0] text-[#D80027]"
                                    : item?.legalitas?.toLowerCase().includes("proses")
                                    ? "bg-[#FFEFBA] text-[#FECC23]"
                                    : "bg-[#D9D9D9] text-[#7E7E7E]"
                                }`}
                              >
                                {item.legalitas}
                              </div>
                            </td>
                          ): null}
                          <td className="text-xs text-center px-4 py-4 flex gap-3 justify-center">
                            <button onClick={() => console.log("Pemetaan clicked")}>
                              <FaMap className="text-gray-400 text-lg" />
                            </button>
                            <button onClick={() => navigate(`/tanah/edit/${item.id_tanah || item.id}`)}>
                              <FaEdit className="text-gray-400 text-lg" />
                            </button>
                            <button onClick={() => handleDelete(item.id_tanah || item.id)}>
                              <FaTrash className="text-gray-400 text-lg" />
                            </button>
                            <button onClick={() => console.log("Riwayat clicked")}>
                              <FaHistory className="text-gray-400 text-lg" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center text-center py-4 text-gray-500"
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

export default Legalitas;