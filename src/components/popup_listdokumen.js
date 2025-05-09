import React, { useState, useEffect } from "react";
import { FaEye, FaDownload, FaTimes } from "react-icons/fa";
import axios from "axios";
import config from "../config";

const PopupListDokumen = ({ idSertifikat, onClose }) => {
  const [dokumenList, setDokumenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dokumen list ketika komponen mount atau idSertifikat berubah
  useEffect(() => {
    const fetchDokumenList = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `${config.API_URL}/sertifikat/${idSertifikat}/dokumen-list`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDokumenList(response.data.data || []);
      } catch (err) {
        setError("Gagal memuat daftar dokumen");
        console.error("Error fetching documents:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDokumenList();
  }, [idSertifikat]);

  const handleViewDocument = (id) => {
    const token = localStorage.getItem("token");
    window.open(
      `${config.API_URL}/dokumen-legalitas/${id}/view?token=${token}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6">
          <p>Memuat daftar dokumen...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-500">{error}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">Daftar Dokumen Legalitas</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {dokumenList.length === 0 ? (
            <p className="text-center py-4">Tidak ada dokumen</p>
          ) : (
            dokumenList.map((dokumen) => (
              <div
                key={dokumen.id}
                className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50 mb-2"
              >
                <div className="flex-1 truncate">
                  <p className="font-medium">{dokumen.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(dokumen.created_at).toLocaleDateString("id-ID")}
                  </p>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleViewDocument(dokumen.id)}
                    className="text-blue-500 hover:text-blue-700 p-2"
                    title="Lihat Dokumen"
                  >
                    <FaEye className="text-lg" />
                  </button>
                  <a
                    href={`${config.API_URL}/dokumen-legalitas/${dokumen.id}/download`}
                    download
                    className="text-green-500 hover:text-green-700 p-2"
                    title="Download Dokumen"
                  >
                    <FaDownload className="text-lg" />
                  </a>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupListDokumen;
