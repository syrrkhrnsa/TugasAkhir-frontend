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
  const [activeMediaTab, setActiveMediaTab] = useState('gambar');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [pemetaanResponse, fasilitasResponse] = await Promise.all([
          axios.get(`http://127.0.0.1:8000/api/fasilitas/public/${id}`),
          axios.get(`http://127.0.0.1:8000/api/fasilitas/detail/public/${id}`)
        ]);

        const pemetaanData = pemetaanResponse.data.data;
        const fasilitasDetail = fasilitasResponse.data.data || {};

        setFasilitas({
          ...pemetaanData,
          ...fasilitasDetail,
          pemetaanFasilitas: {
            nama_fasilitas: pemetaanData.nama_fasilitas,
            jenis_fasilitas: pemetaanData.jenis_fasilitas,
            kategori_fasilitas: pemetaanData.kategori_fasilitas
          },
          tanah: {
            lokasi: pemetaanData.pemetaanTanah?.tanah?.lokasi || 'Tidak tersedia'
          }
        });

        const inventarisResponse = await axios.get(
          `http://127.0.0.1:8000/api/inventaris/fasilitas/${id}/public/detail`
        );
        setInventaris(inventarisResponse.data.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal memuat data fasilitas");
        
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
    if (!file) return (
      <div className="flex items-center justify-center h-40 bg-gray-100 rounded-md">
        <p className="text-gray-500">Tidak ada file</p>
      </div>
    );

    const fileUrl = `http://127.0.0.1:8000/storage/${file}`;
    
    if (type === "image") {
      return (
        <div className="flex justify-center">
          <img 
            src={fileUrl} 
            alt="Gambar Fasilitas" 
            className="max-w-full h-48 object-contain rounded-md shadow-sm border border-gray-200"
          />
        </div>
      );
    } else if (type === "pdf") {
      return (
        <div className="flex flex-col items-center justify-center h-40 bg-gray-100 rounded-md p-4">
          <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
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
          <div className="flex justify-center">
            <img 
              src={fileUrl} 
              alt="Gambar 360°" 
              className="max-w-full h-48 object-contain rounded-md shadow-sm border border-gray-200"
            />
          </div>
        );
      } else if (['mp4'].includes(extension)) {
        return (
          <div className="flex justify-center">
            <video 
              controls 
              className="max-w-full h-48 rounded-md shadow-sm border border-gray-200"
            >
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#187556]"></div>
          <p className="mt-2 text-gray-600">Memuat data fasilitas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-medium">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!fasilitas) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Data fasilitas tidak ditemukan</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#146347]"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {fasilitas.pemetaanFasilitas?.nama_fasilitas || "Detail Fasilitas"}
              </h1>
              <p className="text-gray-600 mt-1">
                {fasilitas.pemetaanFasilitas?.jenis_fasilitas} - {fasilitas.pemetaanFasilitas?.kategori_fasilitas}
              </p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Kembali
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Fasilitas Information */}
            <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                Informasi Fasilitas
              </h3>
              
              <div className="space-y-3">
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
                  <p className="text-gray-800 whitespace-pre-line bg-white p-2 rounded border border-gray-200">
                    {fasilitas.catatan || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* File Attachments */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Dokumen & Media
                </h3>
                
                <div className="mb-4">
                  <div className="flex border-b border-gray-200">
                    <button
                      className={`py-2 px-4 font-medium text-sm ${activeMediaTab === 'gambar' ? 'text-[#187556] border-b-2 border-[#187556]' : 'text-gray-500'}`}
                      onClick={() => setActiveMediaTab('gambar')}
                    >
                      Gambar
                    </button>
                    <button
                      className={`py-2 px-4 font-medium text-sm ${activeMediaTab === '360' ? 'text-[#187556] border-b-2 border-[#187556]' : 'text-gray-500'}`}
                      onClick={() => setActiveMediaTab('360')}
                    >
                      View 360°
                    </button>
                    <button
                      className={`py-2 px-4 font-medium text-sm ${activeMediaTab === 'pdf' ? 'text-[#187556] border-b-2 border-[#187556]' : 'text-gray-500'}`}
                      onClick={() => setActiveMediaTab('pdf')}
                    >
                      Dokumen
                    </button>
                  </div>
                </div>
                
                <div className="min-h-48">
                  {activeMediaTab === 'gambar' && renderFilePreview(fasilitas.file_gambar, "image")}
                  {activeMediaTab === '360' && renderFilePreview(fasilitas.file_360, "360")}
                  {activeMediaTab === 'pdf' && renderFilePreview(fasilitas.file_pdf, "pdf")}
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
                  <thead className="bg-gray-100">
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
                      <tr key={item.id_inventaris || index} className="hover:bg-gray-50">
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
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="mt-2 text-gray-500 italic">Tidak ada data inventaris</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailFasilitasPublic;