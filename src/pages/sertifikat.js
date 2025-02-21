import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Layout from "../components/PageLayout";
import { FaPlus } from "react-icons/fa";

const Sertifikat = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 10;
  const navigate = useNavigate(); // Untuk navigasi halaman

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
      return [1, 2, "...", totalPages - 1, totalPages];
    } else {
      return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
    }
  };

  // Fungsi untuk navigasi ke Form Sertifikat
  const handleAddCertificate = () => {
    navigate("/sertifikat/form"); 
  };

  return (
    <div className="relative">
      {/* Sidebar */}
      <div className="absolute top-0 left-0 z-50">
        <Sidebar />
      </div>

      {/* Layout */}
      <Layout>
        <div className="relative mb-4 flex justify-between items-center">
          <div className="ml-5">
            <h2 className="text-xl font-medium">Sertifikasi Wakaf</h2>
            <p className="text-gray-500">PC Persis Banjaran</p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Cari"
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none"
            />
            <button 
              className="bg-[#187556] text-white p-2 rounded-md hover:bg-[#146347]"
              onClick={handleAddCertificate} // Navigasi ke Form Sertifikat
            >
              <FaPlus />
            </button>
          </div>
        </div>

        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <div className="container">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">No</th>
                    <th className="px-4 py-2 text-left font-medium">No Sertifikat</th>
                    <th className="px-4 py-2 text-left font-medium">Nama Wakif</th>
                    <th className="px-4 py-2 text-left font-medium">Lokasi</th>
                    <th className="px-4 py-2 text-left font-medium">Luas Tanah</th>
                    <th className="px-4 py-2 text-left font-medium">Fasilitas</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan="8" className="border-t border-gray-300 w-[95%] mx-auto"></td>
                  </tr>

                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      Tidak Ada Data Tersedia
                    </td>
                  </tr>

                  <tr>
                    <td colSpan="8" className="border-t border-gray-300 w-[95%] mx-auto"></td>
                  </tr>
                </tbody>
              </table>

              <div className="pagination flex justify-left space-x-1 mt-4">
                <button
                  className={`border border-gray-300 rounded-md px-3 py-1 flex items-center ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ‹
                </button>
                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span key={index} className="px-3 py -1">{page}</span>
                  ) : (
                    <button
                      key={index}
                      className={`border border-gray-300 rounded-md px-3 py-1 font-medium ${currentPage === page ? 'bg-gray-300' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  className={`border border-gray-300 rounded-md px-3 py-1 flex items-center ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : ''}`}
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default Sertifikat;
