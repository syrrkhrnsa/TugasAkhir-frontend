import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaHistory, FaSearch, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";

const Riwayat = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("Riwayat");
  const [subtitle, setSubtitle] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Dapatkan parameter dari URL
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type"); // 'tanah' atau 'sertifikat'
  const scope = queryParams.get("scope"); // 'all' atau 'by-id'
  const id = queryParams.get("id"); // ID spesifik jika scope by-id

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: Silakan login terlebih dahulu.");
        setLoading(false);
        return;
      }

      try {
        let endpoint = "";
        let pageTitle = "";
        let pageSubtitle = "";

        // Tentukan endpoint berdasarkan parameter
        if (type === "tanah") {
          if (scope === "all") {
            endpoint = "/log-tanah";
            pageTitle = "Riwayat Semua Tanah";
            pageSubtitle = "Log semua perubahan tanah";
          } else if (scope === "by-id" && id) {
            endpoint = `/log-tanah/${id}`;
            pageTitle = `Riwayat Tanah #${id.substring(0, 8)}`;
            pageSubtitle = `Log perubahan untuk tanah tertentu`;
          }
        } else if (type === "sertifikat") {
          if (scope === "all") {
            endpoint = "/log-sertifikat";
            pageTitle = "Riwayat Semua Sertifikat";
            pageSubtitle = "Log semua perubahan sertifikat";
          } else if (scope === "by-id" && id) {
            endpoint = `/log-sertifikat/${id}`;
            pageTitle = `Riwayat Sertifikat #${id.substring(0, 8)}`;
            pageSubtitle = `Log perubahan untuk sertifikat tertentu`;
          }
        }

        if (!endpoint) {
          setError("Parameter URL tidak valid");
          setLoading(false);
          return;
        }

        setTitle(pageTitle);
        setSubtitle(pageSubtitle);

        const response = await axios.get(
          `http://127.0.0.1:8000/api${endpoint}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Format respons berbeda-beda tergantung endpoint
        const logsData = response.data.data || response.data;
        setLogs(Array.isArray(logsData) ? logsData : [logsData]);
      } catch (error) {
        console.error("Gagal mengambil data log:", error);
        setError("Gagal memuat data riwayat");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [type, scope, id]);

  const filteredLogs = logs.filter((log) => {
    const searchTerm = search.toLowerCase();
    return (
      (log.nama_user?.toLowerCase().includes(searchTerm) ||
        log.aksi?.toLowerCase().includes(searchTerm) ||
        JSON.stringify(log.perubahan).toLowerCase().includes(searchTerm)) ??
      false
    );
  });

  const formatChanges = (changes) => {
    if (!changes) return "-";

    if (typeof changes === "string") {
      return changes;
    }

    return Object.entries(changes)
      .map(([key, value]) => {
        if (typeof value === "object" && value !== null) {
          return `${key}: ${JSON.stringify(value)}`;
        }
        return `${key}: ${value}`;
      })
      .join(", ");
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
              <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
              <p className="text-sm text-gray-500">{subtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari riwayat..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#187556] focus:border-transparent"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Perubahan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.nama_user || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-medium">
                              {log.aksi || "-"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                            <div className="whitespace-pre-wrap break-words">
                              {formatChanges(log.perubahan)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.tanggal || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.waktu || "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
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
      </Sidebar>
    </div>
  );
};

export default Riwayat;
