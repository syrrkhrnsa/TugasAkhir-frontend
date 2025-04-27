import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaSearch, FaArrowLeft, FaEye } from "react-icons/fa";
import Swal from "sweetalert2";
import { getRoleId, getUserId, getUserName } from "../utils/Auth";

const Log = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("Riwayat Tanah Wakaf");
  const [subtitle, setSubtitle] = useState("PC Persis Banjaran");
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type") || "tanah";
  const id = queryParams.get("id");
  const idTanah = queryParams.get("id_tanah");

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: Silakan login terlebih dahulu.");
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        let endpoint = "";
        let pageTitle = "";
        let pageSubtitle = "";

        if (type === "tanah") {
          if (id) {
            endpoint = `/log-tanah/${id}`;
            pageTitle = `Riwayat Tanah Wakaf`;
            pageSubtitle = "Log perubahan untuk tanah ini";
          } else {
            endpoint = "/log-tanah";
            pageTitle = "Riwayat Tanah Wakaf";
            pageSubtitle = "PC Persis Banjaran";
          }
        } else if (type === "sertifikat") {
          if (id) {
            endpoint = `/log-sertifikat/${id}`;
            pageTitle = `Riwayat Sertifikat Wakaf`;
            pageSubtitle = "Log perubahan untuk sertifikat ini";
          } else if (idTanah) {
            endpoint = `/log-sertifikat-by-tanah/${idTanah}`;
            pageTitle = `Riwayat Sertifikat Wakaf`;
            pageSubtitle = "Log perubahan sertifikat terkait tanah ini";
          } else {
            endpoint = "/log-sertifikat";
            pageTitle = "Riwayat Sertifikat Wakaf";
            pageSubtitle = "PC Persis Banjaran";
          }
        }

        setTitle(pageTitle);
        setSubtitle(pageSubtitle);

        const response = await axios.get(
          `http://127.0.0.1:8000/api${endpoint}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        let logsData = response.data.data || response.data;
        logsData = Array.isArray(logsData) ? logsData : [logsData];

        const currentRoleId = getRoleId();
        const currentUserName = getUserName();

        if (currentRoleId === "326f0dde-2851-4e47-ac5a-de6923447317") {
          logsData = logsData.filter((log) => {
            return (
              log.nama_user === currentUserName ||
              (log.perubahan?.user_id && log.perubahan.user_id === getUserId())
            );
          });
        }

        setLogs(logsData);
      } catch (error) {
        console.error("Gagal mengambil data log:", error);
        if (error.response) {
          if (error.response.status === 401) {
            setError("Sesi telah berakhir. Silakan login kembali.");
            navigate("/login");
          } else if (error.response.data && error.response.data.error) {
            setError(error.response.data.error);
          } else {
            setError("Gagal memuat data riwayat");
          }
        } else {
          setError("Gagal memuat data riwayat");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [type, id, idTanah, navigate]);

  const filteredLogs = logs.filter((log) => {
    const searchTerm = search.toLowerCase();
    return (
      log.nama_user?.toLowerCase().includes(searchTerm) ||
      log.aksi?.toLowerCase().includes(searchTerm) ||
      (log.perubahan &&
        typeof log.perubahan === "string" &&
        log.perubahan.toLowerCase().includes(searchTerm)) ||
      (log.perubahan &&
        typeof log.perubahan === "object" &&
        JSON.stringify(log.perubahan).toLowerCase().includes(searchTerm))
    );
  });

  const formatAction = (action) => {
    if (!action) return "Aksi tidak diketahui";
    const actionMap = {
      create: "Tambah",
      update: "Ubah",
      delete: "Hapus",
      verifikasi: "Verifikasi",
      approve: "Setujui",
    };

    const lowerAction = action.toLowerCase();
    for (const [key, value] of Object.entries(actionMap)) {
      if (lowerAction.includes(key)) {
        return value;
      }
    }
    return action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();
  };

  const getActionColor = (action) => {
    if (!action) return "bg-gray-100 text-gray-800";

    const lowerAction = action.toLowerCase();
    if (lowerAction.includes("create") || lowerAction.includes("tambah")) {
      return "bg-blue-100 text-blue-800";
    } else if (lowerAction.includes("update") || lowerAction.includes("ubah")) {
      return "bg-yellow-100 text-yellow-800";
    } else if (
      lowerAction.includes("delete") ||
      lowerAction.includes("hapus")
    ) {
      return "bg-red-100 text-red-800";
    } else if (
      lowerAction.includes("verifikasi") ||
      lowerAction.includes("approve")
    ) {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const formatChanges = (changes) => {
    if (!changes)
      return <div className="text-gray-500">Tidak ada perubahan detail</div>;

    // Handle perubahan dalam bentuk string
    if (typeof changes === "string") {
      // Coba cari pola khusus untuk perubahan sertifikat
      const sertifikatPattern =
        /(Create|Update|Delete) data sertifikat di bagian (.+)/;
      const match = changes.match(sertifikatPattern);

      if (match) {
        const action = match[1];
        const fields = match[2].split(", ");
        return (
          <div className="space-y-2">
            <div className="font-medium">Aksi: {formatAction(action)}</div>
            <div className="font-medium">Bagian yang diubah:</div>
            <ul className="list-disc pl-5">
              {fields.map((field, index) => (
                <li key={index}>{field.trim()}</li>
              ))}
            </ul>
          </div>
        );
      }

      // Jika bukan pola khusus, tampilkan sebagai teks biasa
      return <div className="whitespace-pre-wrap">{changes}</div>;
    }

    // Handle perubahan dalam bentuk object
    if (typeof changes === "object") {
      // Filter out unwanted fields
      const filteredChanges = Object.entries(changes).filter(
        ([key]) =>
          !key.toLowerCase().includes("id") &&
          !key.toLowerCase().includes("created_at") &&
          !key.toLowerCase().includes("updated_at") &&
          changes[key] !== null && // Exclude null values
          changes[key] !== "" // Exclude empty strings
      );

      if (filteredChanges.length === 0) {
        return (
          <div className="text-gray-500">
            Tidak ada perubahan detail yang relevan
          </div>
        );
      }

      return (
        <div className="space-y-2">
          {filteredChanges.map(([key, value]) => (
            <div
              key={key}
              className="border-b border-gray-100 pb-2 last:border-0"
            >
              <div className="font-medium text-gray-700">
                {key.replace(/_/g, " ")}:
              </div>
              <div className="text-gray-900 break-words">
                {typeof value === "object" && value !== null
                  ? JSON.stringify(value, null, 2)
                  : String(value)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <div className="whitespace-pre-wrap">{String(changes)}</div>;
  };

  const viewLogDetails = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  return (
    <div className="relative">
      <Sidebar>
        {/* Header Section */}
        <div className="relative mb-4 flex flex-col md:flex-row justify-between items-start md:items-center p-4 bg-white shadow-sm rounded-lg">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Kembali"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h2 className="text-xl font-medium text-gray-800">{title}</h2>
              <p className="text-gray-500 text-sm">{subtitle}</p>
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari riwayat..."
                className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#187556] focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#187556]"></div>
                <p className="mt-2 text-gray-600">Memuat data riwayat...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <p className="text-red-500 font-medium">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347] transition-colors"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Penanggung Jawab
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deskripsi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Detail
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="font-medium">
                              {log.nama_user || "-"}
                            </div>
                            <div className="text-xs text-gray-400">
                              {log.role || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span
                              className={`px-2 py-1 rounded-md text-xs ${getActionColor(
                                log.aksi
                              )}`}
                            >
                              {formatAction(log.aksi)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => viewLogDetails(log)}
                              className="flex items-center text-[#187556] hover:text-[#146347] text-sm"
                            >
                              <FaEye className="mr-1" /> Lihat
                            </button>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.tanggal && log.waktu ? (
                              <>
                                <div>{log.tanggal}</div>
                                <div className="text-xs text-gray-400">
                                  {log.waktu}
                                </div>
                              </>
                            ) : log.created_at ? (
                              <>
                                <div>
                                  {new Date(log.created_at).toLocaleDateString(
                                    "id-ID",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {new Date(log.created_at).toLocaleTimeString(
                                    "id-ID",
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </div>
                              </>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          Tidak ada data riwayat yang ditemukan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detail Perubahan
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Aksi
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatAction(selectedLog.aksi)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">
                        Penanggung Jawab
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLog.nama_user || "-"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-gray-500">
                        Waktu
                      </h4>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedLog.tanggal && selectedLog.waktu
                          ? `${selectedLog.tanggal} ${selectedLog.waktu}`
                          : selectedLog.created_at
                          ? new Date(selectedLog.created_at).toLocaleString(
                              "id-ID",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "-"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">
                      Detail Perubahan
                    </h4>
                    <div className="mt-2 p-4 bg-gray-50 rounded-md text-sm">
                      {formatChanges(selectedLog.perubahan)}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347] transition-colors text-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Sidebar>
    </div>
  );
};

export default Log;