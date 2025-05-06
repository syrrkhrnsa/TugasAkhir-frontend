import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FaArrowLeft, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

const DetailInventaris = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [inventaris, setInventaris] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format tanggal untuk tampilan
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

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
          `http://127.0.0.1:8000/api/inventaris/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        
        // Handle both response formats
        const data = response.data.data || response.data;
        if (!data) {
          throw new Error("Data inventaris tidak ditemukan");
        }
        
        setInventaris(data);
        
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        
        let errorMessage = "Gagal memuat data inventaris";
        if (error.response) {
          if (error.response.status === 404) {
            errorMessage = "Data inventaris tidak ditemukan";
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
  const handleDelete = async () => {
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
      await axios.delete(`http://127.0.0.1:8000/api/inventaris/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire({
        title: "Berhasil!",
        text: "Data inventaris telah dihapus.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(`/inventaris/fasilitas/${inventaris.id_fasilitas}`);
      });
    } catch (error) {
      console.error("Gagal menghapus data:", error);
      Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus data.", "error");
    }
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

  if (loading) {
    return (
      <div className="relative">
        <Sidebar>
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#187556]"></div>
            <p className="mt-2 text-gray-600">Memuat data inventaris...</p>
          </div>
        </Sidebar>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative">
        <Sidebar>
          <div className="p-8 text-center">
            <p className="text-red-500 font-medium">{error}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
            >
              Kembali
            </button>
          </div>
        </Sidebar>
      </div>
    );
  }

  if (!inventaris) {
    return (
      <div className="relative">
        <Sidebar>
          <div className="p-8 text-center">
            <p className="text-gray-600">Data inventaris tidak ditemukan</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
            >
              Kembali
            </button>
          </div>
        </Sidebar>
      </div>
    );
  }

  return (
    <div className="relative">
      <Sidebar>
        {/* Header Section */}
        <div className="relative mb-4 flex justify-between items-center p-4 bg-white shadow-sm rounded-lg">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              title="Kembali"
            >
              <FaArrowLeft />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">
              Detail Inventaris
              <p className="text-sm text-gray-500 font-normal">{inventaris.nama_barang}</p>
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <button
              className="p-2 text-white bg-yellow-500 rounded-md hover:bg-yellow-600 transition-colors"
              onClick={() => navigate(`/inventaris/edit/${inventaris.id_inventaris}`)}
              title="Edit"
            >
              <FaEdit />
            </button>
            <button
              className="p-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors"
              onClick={handleDelete}
              title="Hapus"
            >
              <FaTrash />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              {/* Informasi Utama */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Informasi Utama
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nama Barang</p>
                    <p className="font-medium">{inventaris.nama_barang}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Kode Barang</p>
                    <p className="font-medium">{inventaris.kode_barang || "-"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Jumlah</p>
                    <p className="font-medium">
                      {inventaris.jumlah} {inventaris.satuan}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Kondisi</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getKondisiStyle(
                        inventaris.kondisi
                      )}`}
                    >
                      {inventaris.kondisi.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informasi Tambahan */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                  Informasi Tambahan
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Waktu Perolehan</p>
                    <p className="font-medium">{formatDate(inventaris.waktu_perolehan)}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Detail</p>
                    <p className="font-medium">{inventaris.detail || "-"}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Catatan</p>
                    <p className="font-medium">{inventaris.catatan || "-"}</p>
                  </div>
                </div>
              </div>

              {/* History Perubahan (jika ada) */}
              {inventaris.history && inventaris.history.length > 0 && (
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
                    Riwayat Perubahan
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tanggal
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Perubahan
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Oleh
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventaris.history.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(item.tanggal)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {item.perubahan}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.user}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => navigate(`/inventaris/fasilitas/${inventaris.id_fasilitas}`)}
                className="px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347] transition-colors"
              >
                Kembali ke Daftar Inventaris
              </button>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default DetailInventaris;