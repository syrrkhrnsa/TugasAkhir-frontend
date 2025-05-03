import React, { useState, useEffect } from "react";
import axios from "axios";

const FasilitasListCard = ({ item, onClick }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [detailData, setDetailData] = useState(null);

  useEffect(() => {
    // Fungsi untuk mengambil detail fasilitas
    const fetchDetailData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/fasilitas/pemetaan/${item.id_pemetaan_fasilitas}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data.data && response.data.data.length > 0) {
          setDetailData(response.data.data[0]);
          if (response.data.data[0].file_gambar) {
            setImageUrl(
              `http://127.0.0.1:8000/storage/${response.data.data[0].file_gambar.replace(
                /^\/storage\//,
                ""
              )}`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching detail data:", error);
      }
    };

    fetchDetailData();
  }, [item.id_pemetaan_fasilitas]);

  return (
    <div
      className="flex gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          {imageUrl && !imageError ? (
            <img
              src={imageUrl}
              alt={item.nama_fasilitas || "Fasilitas"}
              className="w-full h-full object-cover"
              onError={() => {
                console.error("Gagal memuat gambar:", imageUrl);
                setImageError(true);
              }}
              loading="lazy"
            />
          ) : (
            <div className="text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>
      <div className="flex-grow">
        <h3 className="font-medium text-gray-900 line-clamp-1">
          {item.nama_fasilitas}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
            {item.kategori_fasilitas || "Tanpa Kategori"}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              item.jenis_fasilitas === "Bergerak"
                ? "bg-green-100 text-green-800"
                : "bg-purple-100 text-purple-800"
            }`}
          >
            {item.jenis_fasilitas || "Tidak Diketahui"}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {item.keterangan || "Tidak ada keterangan"}
        </p>
      </div>
    </div>
  );
};

export default FasilitasListCard;
