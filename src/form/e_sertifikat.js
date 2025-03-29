import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes } from "react-icons/fa";

const EditSertifikat = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State untuk data form
  const [formData, setFormData] = useState({
    noDokumen: "",
    jenisSertifikat: "",
    statusPengajuan: "",
    tanggalPengajuan: "",
  });

  // State untuk file preview
  const [filePreviews, setFilePreviews] = useState({
    dokLegalitas: null,
    dokPersyaratan: null,
  });

  // State untuk file yang akan diupload
  const [files, setFiles] = useState({
    dokLegalitas: null,
    dokPersyaratan: null,
  });

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
        setFormData({
          noDokumen: sertifikat.noDokumen || "",
          jenisSertifikat: sertifikat.jenisSertifikat || "",
          statusPengajuan: sertifikat.statusPengajuan || "",
          tanggalPengajuan: sertifikat.tanggalPengajuan || "",
        });

        // Set preview untuk file yang sudah ada
        setFilePreviews({
          dokLegalitas: sertifikat.dokLegalitas
            ? `http://127.0.0.1:8000/storage/${sertifikat.dokLegalitas}`
            : null,
          dokPersyaratan: sertifikat.dokPersyaratan
            ? `http://127.0.0.1:8000/storage/${sertifikat.dokPersyaratan}`
            : null,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengambil data sertifikat.");
      navigate("/dashboard");
    }
  };

  // Handle file change untuk preview
  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set file untuk upload
    setFiles((prev) => ({ ...prev, [field]: file }));

    // Buat preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviews((prev) => ({ ...prev, [field]: previewUrl }));
  };

  // Hapus file yang dipilih
  const handleRemoveFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setFilePreviews((prev) => ({ ...prev, [field]: null }));
    document.getElementById(field).value = ""; // Reset input file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login terlebih dahulu.");
      navigate("/dashboard");
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });
    Object.entries(files).forEach(([key, file]) => {
      if (file) formDataToSend.append(key, file);
    });
    formDataToSend.append('_method', 'PUT');

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/sertifikat/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Data berhasil diperbarui!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error:", error);
      alert(`Gagal memperbarui data. Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Komponen untuk menampilkan preview dokumen
  const FilePreview = ({ field, label }) => (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-400">{label}</label>

      {filePreviews[field] && (
        <div className="mt-2 flex items-center gap-2">
          <a
            href={filePreviews[field]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <FaEye className="mr-1" /> Lihat Dokumen
          </a>
          <button
            type="button"
            onClick={() => handleRemoveFile(field)}
            className="text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <input
        id={field}
        type="file"
        accept=".pdf"
        className="w-full border-b-2 border-gray-300 p-2 focus:outline-none mt-2"
        onChange={(e) => handleFileChange(field, e)}
      />
    </div>
  );

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl">
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Edit</span>{" "}
              <span className="text-[#187556]">Sertifikat</span>
            </h2>

            {loading ? (
              <p className="text-center">Memuat data...</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-8">
                {/* Input untuk No Dokumen */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-400">No Dokumen</label>
                  <input
                    type="text"
                    className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                    value={formData.noDokumen}
                    onChange={(e) => setFormData({ ...formData, noDokumen: e.target.value })}
                  />
                </div>

                {/* Input untuk Jenis Sertifikat */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-400">Jenis Sertifikat</label>
                  <select
                    className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                    value={formData.jenisSertifikat}
                    onChange={(e) => setFormData({ ...formData, jenisSertifikat: e.target.value })}
                  >
                    <option value="">Pilih Jenis Sertifikat</option>
                    <option value="BASTW">BASTW</option>
                    <option value="AIW">AIW</option>
                    <option value="SW">SW</option>
                  </select>
                </div>

                {/* Input untuk Status Pengajuan */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-400">Status Pengajuan</label>
                  <select
                    className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                    value={formData.statusPengajuan}
                    onChange={(e) => setFormData({ ...formData, statusPengajuan: e.target.value })}
                  >
                    <option value="">Pilih Status</option>
                    <option value="Diproses">Diproses</option>
                    <option value="Terbit">Terbit</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>

                {/* Input untuk Tanggal Pengajuan */}
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-400">Tanggal Pengajuan</label>
                  <input
                    type="date"
                    className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                    value={formData.tanggalPengajuan}
                    onChange={(e) => setFormData({ ...formData, tanggalPengajuan: e.target.value })}
                  />
                </div>

                {/* Input untuk Dokumen Legalitas */}
                <FilePreview field="dokLegalitas" label="Dokumen Legalitas" />

                {/* Input untuk Dokumen Persyaratan */}
                <FilePreview field="dokPersyaratan" label="Dokumen Persyaratan" />

                <div className="col-span-2 flex justify-center mt-8">
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