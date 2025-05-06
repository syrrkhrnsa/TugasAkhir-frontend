import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { getRoleId } from "../utils/Auth";
import Swal from "sweetalert2";

const Approval = () => {
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [viewedMessages, setViewedMessages] = useState(new Set());
  const [approvalStatus, setApprovalStatus] = useState({});
  const roleId = getRoleId();
  const isPimpinanJamaah = roleId === "326f0dde-2851-4e47-ac5a-de6923447317";

  const getMessageType = (message) => {
    if (!message?.data?.details) return null;

    const details = message.data.details;

    const isSertifikat =
      details.no_dokumen !== undefined ||
      details.dokumen !== undefined ||
      details.jenis_sertifikat !== undefined ||
      details.previous_data?.no_dokumen !== undefined ||
      details.updated_data?.no_dokumen !== undefined ||
      details.previous_data?.jenis_sertifikat !== undefined ||
      details.updated_data?.jenis_sertifikat !== undefined;

    const isTanah =
      details.NamaPimpinanJamaah !== undefined ||
      details.NamaWakif !== undefined ||
      details.previous_data?.NamaPimpinanJamaah !== undefined ||
      details.updated_data?.NamaPimpinanJamaah !== undefined;

    if (isSertifikat) return "sertifikat";
    if (isTanah) return "tanah";
    return null;
  };

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        "http://127.0.0.1:8000/api/notifications",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        const sortedMessages = response.data.data.sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );
        setMessages(sortedMessages);
      } else {
        console.error("Invalid notifications data format", response.data);
        setMessages([]);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal memuat notifikasi",
        text: "Terjadi kesalahan saat memuat daftar notifikasi.",
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
    const viewed = JSON.parse(localStorage.getItem("viewedMessages")) || [];
    setViewedMessages(new Set(viewed));

    const storedApprovalStatus = localStorage.getItem("approvalStatus");
    if (storedApprovalStatus) {
      try {
        setApprovalStatus(JSON.parse(storedApprovalStatus));
      } catch (error) {
        console.error("Failed to parse approval status:", error);
        localStorage.removeItem("approvalStatus");
      }
    }
  }, []);

  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg);
    setViewedMessages((prev) => {
      const updated = new Set(prev);
      updated.add(msg.id);
      localStorage.setItem(
        "viewedMessages",
        JSON.stringify(Array.from(updated))
      );
      return updated;
    });
  };

  const handleApprove = async () => {
    if (!selectedMessage) return;

    const token = localStorage.getItem("token");
    const approvalId = selectedMessage.data.id_approval;

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/approvals/${approvalId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data telah disetujui dan notifikasi telah dikirim ke Pimpinan Jamaah.",
      });

      const newApprovalStatus = {
        ...approvalStatus,
        [selectedMessage.id]: "approved",
      };
      setApprovalStatus(newApprovalStatus);
      localStorage.setItem("approvalStatus", JSON.stringify(newApprovalStatus));

      await fetchNotifications();

      if (!isPimpinanJamaah) {
        setTimeout(fetchNotifications, 1000);
      }
    } catch (error) {
      console.error("Gagal menyetujui data:", error);
      let errorMessage = "Terjadi kesalahan saat menyetujui data.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: errorMessage,
      });
    }
  };

  const handleReject = async () => {
    if (!selectedMessage) return;

    const token = localStorage.getItem("token");
    const approvalId = selectedMessage.data.id_approval;

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/approvals/${approvalId}/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data telah ditolak dan notifikasi telah dikirim ke Pimpinan Jamaah.",
      });

      const newApprovalStatus = {
        ...approvalStatus,
        [selectedMessage.id]: "rejected",
      };
      setApprovalStatus(newApprovalStatus);
      localStorage.setItem("approvalStatus", JSON.stringify(newApprovalStatus));

      await fetchNotifications();

      if (!isPimpinanJamaah) {
        setTimeout(fetchNotifications, 1000);
      }
    } catch (error) {
      console.error("Gagal menolak data:", error);
      let errorMessage = "Terjadi kesalahan saat menolak data.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: errorMessage,
      });
    }
  };

  const handleUpdateApprove = async () => {
    if (!selectedMessage) return;

    const token = localStorage.getItem("token");
    const approvalId = selectedMessage.data.id_approval;

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/approvals/${approvalId}/update/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data telah disetujui dan disimpan.",
      });

      const newApprovalStatus = {
        ...approvalStatus,
        [selectedMessage.id]: "approved",
      };
      setApprovalStatus(newApprovalStatus);
      localStorage.setItem("approvalStatus", JSON.stringify(newApprovalStatus));
      fetchNotifications();
    } catch (error) {
      console.error("Gagal menyetujui data:", error);
      let errorMessage = "Terjadi kesalahan saat menyetujui data.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: errorMessage,
      });
    }
  };

  const handleUpdateReject = async () => {
    if (!selectedMessage) return;

    const token = localStorage.getItem("token");
    const approvalId = selectedMessage.data.id_approval;

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/approvals/${approvalId}/update/reject`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data telah ditolak.",
      });

      const newApprovalStatus = {
        ...approvalStatus,
        [selectedMessage.id]: "rejected",
      };
      setApprovalStatus(newApprovalStatus);
      localStorage.setItem("approvalStatus", JSON.stringify(newApprovalStatus));
      fetchNotifications();
    } catch (error) {
      console.error("Gagal menolak data:", error);
      let errorMessage = "Terjadi kesalahan saat menolak data.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        errorMessage = error.response.data.message;
      }
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: errorMessage,
      });
    }
  };

  const handlePreviewDokumen = async (dokumen) => {
    if (!dokumen) {
      Swal.fire({
        icon: "warning",
        title: "Dokumen Tidak Tersedia",
        text: "Dokumen belum diupload",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const fileUrl = `http://127.0.0.1:8000/storage/${dokumen}`;

      // Coba akses file langsung tanpa pengecekan HEAD terlebih dahulu
      // Karena masalah CORS mungkin menghalangi pengecekan HEAD
      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("Error accessing document:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Membuka Dokumen",
        text: "Tidak dapat membuka dokumen. Pastikan server berjalan dan konfigurasi CORS sudah benar.",
        confirmButtonText: "OK",
      });
    }
  };

  const renderTanahData = (data, title) => {
    const excludedFields = [
      "id_tanah",
      "user_id",
      "status",
      "created_at",
      "updated_at",
      "id",
      "message",
      "approval_status",
    ];

    // Field name mappings
    const fieldNameMappings = {
      NamaPimpinanJamaah: "Nama Pimpinan Jamaah",
      NamaWakif: "Nama Wakif",
      lokasi: "Lokasi",
      luasTanah: "Luas Tanah",
      koordinat: "Koordinat",
      latitude: "Latitude",
      longitude: "Longitude",
      // Add other field mappings as needed
    };

    const formatValue = (key, value) => {
      if (value === null || value === undefined || value === "") {
        return <span className="text-gray-400 italic">Belum diisi</span>;
      }

      // Handle coordinate object
      if (key === "koordinat" && typeof value === "object") {
        return (
          <div className="space-y-1">
            <div className="text-sm">
              Lat: {value.coordinates[1]?.toFixed(6) || "-"}
            </div>
            <div className="text-sm">
              Lng: {value.coordinates[0]?.toFixed(6) || "-"}
            </div>
          </div>
        );
      }

      // Handle numeric values
      if (key === "latitude" || key === "longitude") {
        return Number(value).toFixed(6);
      }

      return value.toString();
    };

    if (!data)
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Data tidak tersedia</p>
            </div>
          </div>
        </div>
      );

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            ></path>
          </svg>
          {title}
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Field
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data)
                .filter(([key]) => !excludedFields.includes(key))
                .map(([key, value]) => (
                  <tr key={key} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {fieldNameMappings[key] || key.replace(/_/g, " ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatValue(key, value)}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderSertifikatData = (data, title, handlePreviewDokumen) => {
    const excludedFields = [
      "id_sertifikat",
      "user_id",
      "status",
      "created_at",
      "updated_at",
      "id",
      "message",
      "approval_status",
      "id_tanah",
      "jenis_sertifikat",
      "status_pengajuan",
    ];

    if (!data)
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">Data tidak tersedia</p>
            </div>
          </div>
        </div>
      );

    const displayFields = [
      { key: "no_dokumen", label: "No Dokumen" },
      { key: "dokumen", label: "Dokumen" },
      { key: "tanggal_pengajuan", label: "Tanggal Pengajuan" },
    ];

    return (
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          {title}
        </h3>
        <div className="overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayFields.map(({ key, label }) => (
                <tr key={key} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {label}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {key === "tanggal_pengajuan" && data[key] ? (
                        new Date(data[key]).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      ) : key === "dokumen" ? (
                        data[key] ? (
                          <button
                            onClick={() => handlePreviewDokumen(data[key])}
                            className="text-blue-600 hover:underline"
                          >
                            Lihat Dokumen
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">
                            Belum diupload
                          </span>
                        )
                      ) : (
                        data[key] || (
                          <span className="text-gray-400 italic">
                            Belum diisi
                          </span>
                        )
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const messageType = selectedMessage ? getMessageType(selectedMessage) : null;
  const isCreating = !selectedMessage?.data?.details?.previous_data;

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Sidebar>
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              Persetujuan Perubahan
            </h1>
            <p className="text-sm text-gray-500">PC Persis Banjaran</p>
          </div>
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari pesan..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(100vh-150px)]">
          {/* Message List */}
          <div className="w-full md:w-1/3 lg:w-2/5 border-r border-gray-200 bg-white flex flex-col">
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                Daftar Permintaan ({messages.length})
              </h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {messages.map((msg) => {
                  const details = msg.data.details || {};
                  const isMsgCreating = !details.previous_data;
                  const namaPimpinan = isPimpinanJamaah
                    ? msg.data.approvername
                    : msg.data.username || "Unknown";
                  const message =
                    details.message ||
                    msg.data.message ||
                    "Tidak ada pesan tersedia";

                  const formattedDate = new Intl.DateTimeFormat("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }).format(new Date(msg.created_at));

                  return (
                    <li
                      key={msg.id}
                      className={`px-4 py-4 cursor-pointer transition-colors ${
                        selectedMessage?.id === msg.id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={() => handleSelectMessage(msg)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                          {!viewedMessages.has(msg.id) && (
                            <span className="flex-shrink-0 relative inline-block mr-3">
                              <span className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white"></span>
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex justify-between items-start w-full">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {namaPimpinan}
                                </p>
                                <p className="text-sm text-gray-500 truncate mt-1">
                                  {message}
                                </p>
                              </div>
                              <time className="flex-shrink-0 whitespace-nowrap text-sm text-gray-500 ml-2">
                                {formattedDate}
                              </time>
                            </div>
                            <div className="mt-2">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isMsgCreating
                                    ? "bg-green-100 text-green-800"
                                    : "bg-blue-100 text-blue-800"
                                }`}
                              >
                                {isMsgCreating
                                  ? "Pembuatan Baru"
                                  : "Perubahan Data"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Message Detail */}
          <div className="w-full md:w-2/3 lg:w-3/5 bg-white flex flex-col">
            {selectedMessage ? (
              <>
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h2 className="text-lg font-medium text-gray-900">
                    Detail Permintaan
                  </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                  {messageType === "sertifikat" ? (
                    isCreating ? (
                      renderSertifikatData(
                        selectedMessage.data.details,
                        "Detail Sertifikat",
                        handlePreviewDokumen
                      )
                    ) : (
                      <div className="space-y-8">
                        {renderSertifikatData(
                          selectedMessage.data.details.previous_data,
                          "Data Sebelumnya",
                          handlePreviewDokumen
                        )}
                        {renderSertifikatData(
                          selectedMessage.data.details.updated_data,
                          "Data Terbaru",
                          handlePreviewDokumen
                        )}
                      </div>
                    )
                  ) : messageType === "tanah" ? (
                    isCreating ? (
                      renderTanahData(
                        selectedMessage.data.details,
                        "Detail Tanah"
                      )
                    ) : (
                      <div className="space-y-8">
                        {renderTanahData(
                          selectedMessage.data.details.previous_data,
                          "Data Sebelumnya"
                        )}
                        {renderTanahData(
                          selectedMessage.data.details.updated_data,
                          "Data Terbaru"
                        )}
                      </div>
                    )
                  ) : (
                    <div className="rounded-md bg-yellow-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-5 w-5 text-yellow-400"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">
                            Format tidak dikenali
                          </h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              Format data tidak sesuai dengan yang diharapkan.
                              Silakan periksa kembali.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Approval Actions */}
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  {isPimpinanJamaah ? (
                    <div>
                      {approvalStatus[selectedMessage.id] === "approved" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <svg
                            className="-ml-1 mr-1.5 h-2.5 w-2.5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 8 8"
                          >
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          Data disetujui
                        </span>
                      ) : approvalStatus[selectedMessage.id] === "rejected" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <svg
                            className="-ml-1 mr-1.5 h-2.5 w-2.5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 8 8"
                          >
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          Data ditolak
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <>
                      {approvalStatus[selectedMessage.id] === "approved" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          <svg
                            className="-ml-1 mr-1.5 h-2.5 w-2.5 text-green-500"
                            fill="currentColor"
                            viewBox="0 0 8 8"
                          >
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          Data disetujui
                        </span>
                      ) : approvalStatus[selectedMessage.id] === "rejected" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                          <svg
                            className="-ml-1 mr-1.5 h-2.5 w-2.5 text-red-500"
                            fill="currentColor"
                            viewBox="0 0 8 8"
                          >
                            <circle cx="4" cy="4" r="3" />
                          </svg>
                          Data ditolak
                        </span>
                      ) : (
                        <div className="flex space-x-3">
                          <button
                            onClick={
                              isCreating ? handleApprove : handleUpdateApprove
                            }
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <svg
                              className="-ml-1 mr-2 h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Setujui
                          </button>
                          <button
                            onClick={
                              isCreating ? handleReject : handleUpdateReject
                            }
                            type="button"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <svg
                              className="-ml-1 mr-2 h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Tolak
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  ></path>
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  Tidak ada pesan dipilih
                </h3>
                <p className="mt-1 text-sm text-gray-500 max-w-md">
                  Pilih pesan dari daftar di sebelah kiri untuk melihat detail
                  permintaan persetujuan.
                </p>
              </div>
            )}
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default Approval;
