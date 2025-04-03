import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaSearch, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import { getRoleId, getUserId } from "../utils/Auth";

const Log = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("Riwayat Tanah Wakaf");
  const [subtitle, setSubtitle] = useState("PC Persis Banjaran");
  const navigate = useNavigate();
  const location = useLocation();

  // Get query parameters
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type") || "tanah";
  const id = queryParams.get("id");

  // Role constants for easier reference
  const ROLES = {
    PIMPINAN_CABANG: "3594bece-a684-4287-b0a2-7429199772a3",
    BIDGAR_WAKAF: "26b2b64e-9ae3-4e2e-9063-590b1bb00480",
    PIMPINAN_JAMAAT: "326f0dde-2851-4e47-ac5a-de6923447317",
  };

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

        // Determine endpoint based on parameters
        if (type === "tanah") {
          if (id) {
            endpoint = `/log-tanah/${id}`;
            pageTitle = `Riwayat Tanah #${id.substring(0, 8)}`;
            pageSubtitle = "Log perubahan untuk tanah tertentu";
          } else {
            endpoint = "/log-tanah";
            pageTitle = "Riwayat Tanah Wakaf";
            pageSubtitle = "PC Persis Banjaran";
          }
        } else if (type === "sertifikat") {
          if (id) {
            endpoint = `/log-sertifikat/${id}`;
            pageTitle = `Riwayat Sertifikat #${id.substring(0, 8)}`;
            pageSubtitle = "Log perubahan untuk sertifikat tertentu";
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

        // Format response data
        let logsData = response.data.data || response.data;
        logsData = Array.isArray(logsData) ? logsData : [logsData];

        // Filter logs based on user role
        const currentRoleId = getRoleId();
        const currentUserId = getUserId();

        console.log("Current Role ID:", currentRoleId);
        console.log("Current User ID:", currentUserId);
        console.log("Logs before filtering:", logsData);

        // Pimpinan Jamaah can only see their own logs
        if (currentRoleId === "326f0dde-2851-4e47-ac5a-de6923447317") {
          logsData = logsData.filter((log) => {
            // For all log types, check both nama_user and perubahan.user_id
            return (
              log.nama_user === currentUserId ||
              (log.perubahan?.user_id &&
                log.perubahan.user_id === currentUserId)
            );
          });
        }

        console.log("Logs after filtering:", logsData);
        setLogs(logsData);
      } catch (error) {
        console.error("Gagal mengambil data log:", error);
        if (error.response && error.response.status === 401) {
          setError("Sesi telah berakhir. Silakan login kembali.");
          navigate("/login");
        } else {
          setError("Gagal memuat data riwayat");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [type, id, navigate]);

  const filteredLogs = logs.filter((log) => {
    const searchTerm = search.toLowerCase();
    return (
      log.nama_user?.toLowerCase().includes(searchTerm) ||
      log.aksi?.toLowerCase().includes(searchTerm) ||
      JSON.stringify(log.perubahan).toLowerCase().includes(searchTerm)
    );
  });

  const formatChanges = (changes) => {
    if (!changes) return "-";

    if (typeof changes === "string") {
      try {
        const parsed = JSON.parse(changes);
        return formatChanges(parsed);
      } catch {
        return changes;
      }
    }

    if (typeof changes === "object") {
      return Object.entries(changes)
        .map(([key, value]) => {
          if (typeof value === "object" && value !== null) {
            return `${key}: ${JSON.stringify(value)}`;
          }
          return `${key}: ${value}`;
        })
        .join(", ");
    }

    return String(changes);
  };

  return (
    <div className="relative">
      <Sidebar>
        {/* Header Section */}
        <div className="relative mb-4 flex justify-between items-center p-4 bg-white shadow-sm rounded-lg">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Kembali"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h2 className="text-xl font-medium">{title}</h2>
              <p className="text-gray-500">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari"
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#187556] focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-6"
            style={{
              boxShadow:
                "0px 5px 15px rgba(0, 0, 0, 0.1), 0px -5px 15px rgba(0, 0, 0, 0.1), 5px 0px 15px rgba(0, 0, 0, 0.1), -5px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
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
                  className="mt-2 px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
                >
                  Coba Lagi
                </button>
              </div>
            ) : (
              <div className="container">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="px-4 py-2 text-left font-medium">No</th>
                      <th className="px-4 py-2 text-left font-medium">
                        Penanggung Jawab
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Deskripsi Perubahan
                      </th>
                      <th className="px-4 py-2 text-left font-medium">
                        Stempel Waktu
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-300 hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">{index + 1}</td>
                          <td className="px-4 py-2">{log.nama_user || "-"}</td>
                          <td className="px-4 py-2">
                            <div className="whitespace-pre-wrap break-words">
                              {log.aksi
                                ? `${log.aksi} - ${formatChanges(
                                    log.perubahan
                                  )}`
                                : formatChanges(log.perubahan)}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {log.tanggal && log.waktu
                              ? `${log.tanggal} ${log.waktu}`
                              : log.created_at
                              ? new Date(log.created_at).toLocaleString()
                              : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-2 text-center text-gray-500"
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
      </Sidebar>
    </div>
  );
};

export default Log;
