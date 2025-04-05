import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaHistory,
  FaMap,
} from "react-icons/fa";
import { getRoleId } from "../utils/Auth";
import Swal from "sweetalert2";

const Legalitas = () => {
  // State management
  const [tanahDisetujui, setTanahDisetujui] = useState([]);
  const [approvalTanah, setApprovalTanah] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [legalitasOptions, setLegalitasOptions] = useState([]);
  const [selectedLegalitas, setSelectedLegalitas] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // User info
  const roleId = getRoleId();
  const isPimpinanJamaah = roleId === "326f0dde-2851-4e47-ac5a-de6923447317";
  const userId = localStorage.getItem("user_id");

  // Fetch data with ownership filtering
  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("user_name");
    if (!token) {
      setError("Unauthorized: Silakan login terlebih dahulu.");
      setLoading(false);
      return;
    }

    try {
      // Endpoint yang sama untuk semua role
      const tanahUrl = "http://127.0.0.1:8000/api/tanah";

      // Untuk approval, filter khusus untuk Pimpinan Jamaah
      const approvalUrl = isPimpinanJamaah
        ? `http://127.0.0.1:8000/api/approvals/type/tanah?user_id=${userId}`
        : "http://127.0.0.1:8000/api/approvals/type/tanah";

      const [tanahResponse, approvalResponse] = await Promise.all([
        axios.get(tanahUrl, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(approvalUrl, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Data tanah sudah difilter oleh backend, cukup set langsung
      setTanahDisetujui(tanahResponse.data.data || []);

      // Filter approval untuk Pimpinan Jamaah
      let filteredApproval = approvalResponse.data.data || [];
      if (isPimpinanJamaah) {
        filteredApproval = filteredApproval.filter(
          (approval) =>
            (approval.NamaPimpinanJamaah ||
              approval.data?.details?.NamaPimpinanJamaah) === userName
        );
      }
      setApprovalTanah(filteredApproval);
    } catch (error) {
      console.error("Gagal mengambil data:", error);
      setError("Gagal memuat data tanah");
    } finally {
      setLoading(false);
    }
  }, [isPimpinanJamaah, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Combine and filter data
  const combinedData = useMemo(() => {
    // Untuk Pimpinan Jamaah: gabungkan data tanah dan approval miliknya
    if (isPimpinanJamaah) {
      const allTanah = [
        ...tanahDisetujui.map((item) => ({
          ...item,
          status: item.status || "disetujui",
          isFromApproval: false,
        })),
      ];

      // Tambahkan data approval yang belum ada di tanahDisetujui
      approvalTanah.forEach((approval) => {
        // Cek duplikat
        const isDuplicate = allTanah.some(
          (item) =>
            item.id_tanah ===
            (approval.id_tanah || approval.data?.details?.id_tanah)
        );

        if (
          !isDuplicate &&
          (approval.status === "ditinjau" || !approval.status)
        ) {
          allTanah.push({
            ...(approval.data?.details || approval),
            id_tanah: approval.id_tanah || approval.data?.details?.id_tanah,
            id_approval: approval.id,
            status: approval.status || "ditinjau",
            isFromApproval: true,
          });
        }
      });

      return allTanah;
    }

    // Untuk Pimpinan Cabang/Bidgar Wakaf: hanya data tanah dengan status disetujui
    return tanahDisetujui.map((item) => ({
      ...item,
      status: "disetujui",
      isFromApproval: false,
    }));
  }, [tanahDisetujui, approvalTanah, isPimpinanJamaah]);

  // Search and pagination
  const filteredData = combinedData.filter(
    (item) =>
      (item.NamaPimpinanJamaah?.toLowerCase() || "").includes(
        search.toLowerCase()
      ) ||
      (item.NamaWakif?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (item.lokasi?.toLowerCase() || "").includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Action handlers with ownership checks
  const handleDelete = async (id, isFromApproval = false) => {
    const item = combinedData.find(
      (item) => item.id_tanah === id || item.id_approval === id
    );

    if (isPimpinanJamaah && item?.user_id !== userId) {
      Swal.fire("Error", "Anda hanya dapat menghapus data milik Anda", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
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
      if (isFromApproval) {
        await axios.delete(`http://127.0.0.1:8000/api/approvals/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApprovalTanah((prev) => prev.filter((item) => item.id !== id));
      } else {
        await axios.delete(`http://127.0.0.1:8000/api/tanah/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTanahDisetujui((prev) =>
          prev.filter((item) => item.id_tanah !== id)
        );
      }

      Swal.fire("Berhasil!", "Data telah dihapus.", "success");
      fetchData();
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
    }
  };

  // UI helpers
  const getStatusStyle = (status) => {
    switch (status) {
      case "disetujui":
        return "bg-[#AFFEB5] text-[#187556]";
      case "ditolak":
        return "bg-[#FEC5D0] text-[#D80027]";
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

  // Modal functions
  const openModal = async (item) => {
    if (isPimpinanJamaah && item.user_id !== userId) {
      Swal.fire("Error", "Anda tidak memiliki akses", "error");
      return;
    }

    setSelectedItem(item);
    setIsModalOpen(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/sertifikat/legalitas/${item.id_tanah}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        const legalitasList = response.data.data.legalitas.map(
          (item) => item.jenis_sertifikat
        );
        setLegalitasOptions(legalitasList);
        setSelectedLegalitas(legalitasList[0] || "");
      }
    } catch (error) {
      console.error("Error fetching legalitas:", error);
      Swal.fire("warning", "data legalitas belum tersedia", "warning");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleUpdateLegalitas = async () => {
    if (!selectedItem || !selectedLegalitas) return;

    const token = localStorage.getItem("token");
    setIsProcessing(true);

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/tanah/legalitas/${selectedItem.id_tanah}`,
        { legalitas: selectedLegalitas },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      Swal.fire("Berhasil!", "Legalitas berhasil diperbarui!", "success");
      fetchData();
      closeModal();
    } catch (error) {
      console.error("Gagal mengupdate legalitas:", error);
      Swal.fire(
        "Gagal!",
        "Terjadi kesalahan saat mengupdate legalitas.",
        "error"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const renderActionButton = (item, action, icon, label) => {
    // Get the current user's role
    const currentUserRole = getRoleId();

    // Define role IDs for reference
    const rolePimpinanJamaah = "326f0dde-2851-4e47-ac5a-de6923447317";
    const rolePimpinanCabang = "3594bece-a684-4287-b0a2-7429199772a3";
    const roleBidgarWakaf = "26b2b64e-9ae3-4e2e-9063-590b1bb00480";

    // Check if the current user is Pimpinan Jamaah
    const isCurrentUserPimpinanJamaah = currentUserRole === rolePimpinanJamaah;

    // Check if the data creator is Pimpinan Jamaah
    const isCreatorPimpinanJamaah = item.user_role === rolePimpinanJamaah;

    // Check if the data creator is Bidgar Wakaf or Pimpinan Cabang
    const isCreatorAdmin = [roleBidgarWakaf, rolePimpinanCabang].includes(
      item.user_role
    );

    // Determine if the button should be disabled
    let isDisabled = item.isFromApproval && item.status !== "disetujui";

    // Special case: If current user is Pimpinan Jamaah and data was created by another Pimpinan Jamaah
    if (
      isCurrentUserPimpinanJamaah &&
      isCreatorPimpinanJamaah &&
      item.user_id !== userId
    ) {
      isDisabled = true;
    }

    // Special case: If current user is Pimpinan Jamaah and data was created by admin (Bidgar/Pimpinan Cabang)
    if (isCurrentUserPimpinanJamaah && isCreatorAdmin) {
      isDisabled = false; // Allow access even though user_id doesn't match
    }

    if (isDisabled) {
      return (
        <button
          className={`p-1 text-gray-400 cursor-not-allowed`}
          title={label}
          disabled
        >
          {icon}
        </button>
      );
    }

    return (
      <button
        onClick={() => action(item.id_tanah || item.id_approval)}
        className="p-1 text-gray-400 hover:text-gray-600"
        title={label}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className="relative">
      <Sidebar>
        {/* Header Section */}
        <div className="relative mb-4 flex justify-between items-center p-4 bg-white shadow-sm rounded-lg">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Legalitas Tanah Wakaf
            </h2>
            <p className="text-sm text-gray-500">PC Persis Banjaran</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              className="p-2 text-white bg-[#2C3E50] rounded-md hover:bg-[#1A2A3A] transition-colors"
              onClick={() => navigate("/riwayat/tanah")}
              title="Riwayat"
            >
              <FaHistory className="text-sm" />
            </button>

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

            <button
              className="p-2 text-white bg-[#187556] rounded-md hover:bg-[#146347] transition-colors"
              onClick={() => navigate("/tanah/create")}
              title="Tambah Baru"
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
                    <thead className="bg-gray-50">
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
                          Status
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
                          <tr
                            key={item.id_tanah || item.id_approval || index}
                            className="hover:bg-gray-50"
                          >
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
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                                  item.status
                                )}`}
                              >
                                {item.status}
                              </span>
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
                                  {
                                    <button
                                      className="ml-2 bg-white text-black px-2 py-1 rounded-md hover:bg-gray-200 text-xs"
                                      onClick={() => openModal(item)}
                                      disabled={
                                        item.isFromApproval &&
                                        item.status !== "disetujui"
                                      }
                                    >
                                      <FaEdit />
                                    </button>
                                  }
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                {renderActionButton(
                                  item,
                                  (id) => navigate(`/tanah/detail/${id}`),
                                  <FaEye />,
                                  "Detail"
                                )}
                                {renderActionButton(
                                  item,
                                  (id) => navigate(`/tanah/peta/${id}`),
                                  <FaMap />,
                                  "Pemetaan"
                                )}
                                {renderActionButton(
                                  item,
                                  (id) => navigate(`/log?type=tanah&id=${id}`),
                                  <FaHistory />,
                                  "Riwayat"
                                )}
                                {renderActionButton(
                                  item,
                                  (id) => navigate(`/tanah/edit/${id}`),
                                  <FaEdit />,
                                  "Edit"
                                )}
                                {renderActionButton(
                                  item,
                                  (id) => handleDelete(id, item.isFromApproval),
                                  <FaTrash />,
                                  "Hapus"
                                )}
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

        {/* Legalitas Update Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Update Status Legalitas
                </h3>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Legalitas
                  </label>
                  {legalitasOptions.length > 0 ? (
                    <select
                      value={selectedLegalitas}
                      onChange={(e) => setSelectedLegalitas(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#187556] focus:border-[#187556] sm:text-sm rounded-md"
                    >
                      {legalitasOptions.map((option, index) => (
                        <option key={index} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Tidak ada data legalitas tersedia
                    </p>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleUpdateLegalitas}
                  disabled={isProcessing || legalitasOptions.length === 0}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#187556] hover:bg-[#146347] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556] disabled:opacity-50"
                >
                  {isProcessing ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  );
};

export default Legalitas;
