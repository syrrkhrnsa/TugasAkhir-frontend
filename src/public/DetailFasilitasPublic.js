import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const DetailFasilitasPublic = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fasilitas, setFasilitas] = useState(null);
  const [inventaris, setInventaris] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
        try {
          setLoading(true);
          
          // Fetch facility data
          const fasilitasResponse = await axios.get(
            `http://127.0.0.1:8000/api/fasilitas/public/${id}`
          );
          
          // Fetch inventory data
          const inventarisResponse = await axios.get(
            `http://127.0.0.1:8000/api/inventaris/fasilitas/${id}/public`
          );
      
          const fasilitasData = fasilitasResponse.data.data;
          
          // Transform data structure
          setFasilitas({
            ...fasilitasData,
            pemetaanFasilitas: {
              nama_fasilitas: fasilitasData.nama_fasilitas,
              jenis_fasilitas: fasilitasData.jenis_fasilitas,
              kategori_fasilitas: fasilitasData.kategori_fasilitas
            },
            tanah: {
              lokasi: fasilitasData.lokasi || 'Tidak tersedia'
            }
          });
      
          setInventaris(inventarisResponse.data.data || []);
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Gagal memuat data fasilitas");
          
          // More detailed error handling
          if (err.response) {
            if (err.response.status === 404) {
              setError("Fasilitas tidak ditemukan");
            } else {
              setError(`Error: ${err.response.status} - ${err.response.statusText}`);
            }
          } else if (err.request) {
            setError("Tidak ada respon dari server");
          } else {
            setError("Error dalam mengkonfigurasi request");
          }
        } finally {
          setLoading(false);
        }
      };

    fetchData();
  }, [id]);

  const renderFilePreview = (file, type) => {
    if (!file) return null;

    const fileUrl = `http://127.0.0.1:8000/storage/${file}`;
    
    if (type === "image") {
      return (
        <div className="mt-2">
          <img 
            src={fileUrl} 
            alt="Gambar Fasilitas" 
            className="max-w-full h-auto rounded-md shadow-sm border border-gray-200"
          />
        </div>
      );
    } else if (type === "pdf") {
      return (
        <div className="mt-2">
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Lihat PDF
          </a>
        </div>
      );
    } else if (type === "360") {
      const extension = file.split('.').pop().toLowerCase();
      if (['jpg', 'jpeg', 'png'].includes(extension)) {
        return (
          <div className="mt-2">
            <img 
              src={fileUrl} 
              alt="Gambar 360°" 
              className="max-w-full h-auto rounded-md shadow-sm border border-gray-200"
            />
          </div>
        );
      } else if (['mp4'].includes(extension)) {
        return (
          <div className="mt-2">
            <video controls className="max-w-full rounded-md shadow-sm border border-gray-200">
              <source src={fileUrl} type="video/mp4" />
              Browser Anda tidak mendukung pemutar video.
            </video>
          </div>
        );
      }
    }
    
    return null;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  const getConditionBadge = (kondisi) => {
    switch (kondisi) {
      case 'baik':
        return 'bg-green-100 text-green-800';
      case 'rusak_ringan':
        return 'bg-yellow-100 text-yellow-800';
      case 'rusak_berat':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#187556]"></div>
        <p className="mt-2 text-gray-600">Memuat data fasilitas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
        >
          Kembali
        </button>
      </div>
    );
  }

  if (!fasilitas) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Data fasilitas tidak ditemukan</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {fasilitas.pemetaanFasilitas?.nama_fasilitas || "Detail Fasilitas"}
              </h2>
              <p className="text-gray-600 mt-1">
                {fasilitas.pemetaanFasilitas?.jenis_fasilitas} - {fasilitas.pemetaanFasilitas?.kategori_fasilitas}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Kembali
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Fasilitas Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Informasi Fasilitas
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Jenis Fasilitas</p>
                  <p className="text-gray-800">
                    {fasilitas.pemetaanFasilitas?.jenis_fasilitas || "-"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Kategori</p>
                  <p className="text-gray-800">
                    {fasilitas.pemetaanFasilitas?.kategori_fasilitas || "-"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Lokasi Tanah</p>
                  <p className="text-gray-800">
                    {fasilitas.tanah?.lokasi || "-"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Tanggal Dibuat</p>
                  <p className="text-gray-800">
                    {formatDate(fasilitas.created_at) || "-"}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Catatan</p>
                  <p className="text-gray-800 whitespace-pre-line">
                    {fasilitas.catatan || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Dokumen & Media
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Gambar Fasilitas</p>
                  {fasilitas.file_gambar ? (
                    renderFilePreview(fasilitas.file_gambar, "image")
                  ) : (
                    <p className="text-gray-500 italic">Tidak ada gambar</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">File 360°</p>
                  {fasilitas.file_360 ? (
                    renderFilePreview(fasilitas.file_360, "360")
                  ) : (
                    <p className="text-gray-500 italic">Tidak ada file 360°</p>
                  )}
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Dokumen PDF</p>
                  {fasilitas.file_pdf ? (
                    renderFilePreview(fasilitas.file_pdf, "pdf")
                  ) : (
                    <p className="text-gray-500 italic">Tidak ada dokumen PDF</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Section */}
          <div className="mt-8 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              Inventaris Fasilitas
            </h3>
            
            {inventaris.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Barang
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kode Barang
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Satuan
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kondisi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Waktu Perolehan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {inventaris.map((item, index) => (
                      <tr key={item.id_inventaris || index}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.nama_barang}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.kode_barang || "-"}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.jumlah}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.satuan}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            getConditionBadge(item.kondisi)
                          }`}>
                            {item.kondisi === 'baik' ? 'Baik' : 
                             item.kondisi === 'rusak_ringan' ? 'Rusak Ringan' : 
                             item.kondisi === 'rusak_berat' ? 'Rusak Berat' : 
                             item.kondisi}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.waktu_perolehan ? formatDate(item.waktu_perolehan) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 italic">Tidak ada data inventaris</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailFasilitasPublic;