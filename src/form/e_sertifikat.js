import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye } from "react-icons/fa";

const EditSertifikat = () => {
  const { id } = useParams(); // Ambil ID sertifikat dari URL
  const navigate = useNavigate();

  const [noDokumenBastw, setNoDokumenBastw] = useState("");
  const [noDokumenAIW, setNoDokumenAIW] = useState("");
  const [noDokumenSW, setNoDokumenSW] = useState("");
  const [dokBastw, setDokBastw] = useState(null);
  const [dokAiw, setDokAiw] = useState(null);
  const [dokSw, setDokSw] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSertifikat();
  }, []);

  const fetchSertifikat = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk melihat data sertifikat.");
      navigate("/dashboard");
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/sertifikat/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const sertifikat = response.data.data || response.data;
      if (sertifikat) {
        setNoDokumenBastw(sertifikat.noDokumenBastw || "");
        setNoDokumenAIW(sertifikat.noDokumenAIW || "");
        setNoDokumenSW(sertifikat.noDokumenSW || "");
        // Jika ada file yang sudah diunggah sebelumnya, Anda bisa menyimpannya di state
        // setDokBastw(sertifikat.dokBastw || null);
        setDokBastw("http://127.0.0.1:8000/storage/file.pdf" || null);
        setDokAiw(sertifikat.dokAiw || null);
        setDokSw(sertifikat.dokSw || null);
      }
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data sertifikat:", error);
      alert("Gagal mengambil data sertifikat.");
      navigate("/dashboard");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login untuk mengedit data.");
      return;
    }

    const formData = new FormData();
    formData.append("noDokumenBastw", noDokumenBastw);
    formData.append("noDokumenAIW", noDokumenAIW);
    formData.append("noDokumenSW", noDokumenSW);
    if (dokBastw) formData.append("dokBastw", dokBastw);
    if (dokAiw) formData.append("dokAiw", dokAiw);
    if (dokSw) formData.append("dokSw", dokSw);

    try {
      await axios.put(`http://127.0.0.1:8000/api/sertifikat/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Data sertifikat berhasil diperbarui!");
      navigate("/dashboard"); // Kembali ke dashboard setelah berhasil
    } catch (error) {
      console.error("Gagal memperbarui data sertifikat:", error);
      alert("Terjadi kesalahan saat memperbarui data sertifikat.");
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl"
            style={{
              boxShadow:
                "0px 5px 15px rgba(0, 0, 0, 0.1), 0px -5px 15px rgba(0, 0, 0, 0.1), 5px 0px 15px rgba(0, 0, 0, 0.1), -5px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Edit</span>{" "}
              <span className="text-[#187556]">Sertifikat</span>
            </h2>
            <p className="text-center text-gray-500">PC Persis Banjaran</p>

            {loading ? (
              <p className="text-center text-gray-500 mt-6">Memuat data...</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Input untuk No Dokumen BASTW */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-400">
                      No Dokumen BASTW
                    </label>
                    <input
                      type="text"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                      value={noDokumenBastw}
                      onChange={(e) => setNoDokumenBastw(e.target.value)}
                    />
                  </div>

                  {/* Input untuk Upload Dokumen BASTW */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-400">
                      Dokumen BASTW
                    </label>
                    {dokBastw && (
                      <div className="mt-2">
                        <a
                          href={dokBastw} // URL file yang sudah diunggah
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Lihat Dokumen BASTW
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none mt-2"
                      onChange={(e) => setDokBastw(e.target.files[0])}
                    />
                  </div>

                  {/* Input untuk No Dokumen AIW */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-400">
                      No Dokumen AIW
                    </label>
                    <input
                      type="text"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                      value={noDokumenAIW}
                      onChange={(e) => setNoDokumenAIW(e.target.value)}
                    />
                  </div>

                  {/* Input untuk Upload Dokumen AIW */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-400">
                      Dokumen AIW
                    </label>
                    {dokAiw && (
                      <div className="mt-2">
                        <a
                          href={dokAiw} // URL file yang sudah diunggah
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Lihat Dokumen AIW
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none mt-2"
                      onChange={(e) => setDokAiw(e.target.files[0])}
                    />
                  </div>

                  {/* Input untuk No Dokumen SW */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-400">
                      No Dokumen SW
                    </label>
                    <input
                      type="text"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                      value={noDokumenSW}
                      onChange={(e) => setNoDokumenSW(e.target.value)}
                    />
                  </div>

                  {/* Input untuk Upload Dokumen SW */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-400">
                      Dokumen SW
                    </label>
                    {dokSw && (
                      <div className="mt-2">
                        <a
                          href={dokSw} // URL file yang sudah diunggah
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700"
                        >
                          Lihat Dokumen SW
                        </a>
                      </div>
                    )}
                    <input
                      type="file"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none mt-2"
                      onChange={(e) => setDokSw(e.target.files[0])}
                    />
                  </div>
                </div>

                {/* Tombol Simpan */}
                <div className="flex justify-center mt-8">
                  <button
                    type="submit"
                    className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB]"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default EditSertifikat;
