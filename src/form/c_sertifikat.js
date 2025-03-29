import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes } from "react-icons/fa";

const CreateSertifikat = () => {
  const navigate = useNavigate();

  // State untuk data form
  const [formData, setFormData] = useState({
    noDokumen: "",
    jenisSertifikat: "",
    statusPengajuan: "",
    tanggalPengajuan: "",
  });

  // State untuk file upload dan preview
  const [filePreviews, setFilePreviews] = useState({ dokLegalitas: null, dokPersyaratan: null });
  const [files, setFiles] = useState({ dokLegalitas: null, dokPersyaratan: null });

  // Handle file change untuk preview
  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFiles((prev) => ({ ...prev, [field]: file }));
    setFilePreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
  };

  // Hapus file yang dipilih
  const handleRemoveFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setFilePreviews((prev) => ({ ...prev, [field]: null }));
    document.getElementById(field).value = "";
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
    Object.entries(formData).forEach(([key, value]) => formDataToSend.append(key, value));
    Object.entries(files).forEach(([key, file]) => file && formDataToSend.append(key, file));

    try {
      await axios.post("http://127.0.0.1:8000/api/sertifikat", formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      alert("Sertifikat berhasil dibuat!");
      navigate("/dashboard");
    } catch (error) {
      alert(`Gagal membuat sertifikat: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl">
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Sertifikat</span> <span className="text-[#187556]">Baru</span>
            </h2>
            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-2 gap-8">
              {[{ field: "noDokumen", label: "No Dokumen" }].map(({ field, label }) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-400">{label}</label>
                  <input
                    type="text"
                    className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                    value={formData[field]}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  />
                </div>
              ))}

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

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">Tanggal Pengajuan</label>
                <input
                  type="date"
                  className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                  value={formData.tanggalPengajuan}
                  onChange={(e) => setFormData({ ...formData, tanggalPengajuan: e.target.value })}
                />
              </div>

              {[{ field: "dokLegalitas", label: "Dokumen Legalitas" }, { field: "dokPersyaratan", label: "Dokumen Persyaratan" }].map(({ field, label }) => (
                <div key={field} className="flex flex-col">
                  <label className="text-sm font-medium text-gray-400">{label}</label>
                  {filePreviews[field] && (
                    <div className="mt-2 flex items-center gap-2">
                      <a href={filePreviews[field]} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                        <FaEye className="mr-1" /> Lihat Dokumen
                      </a>
                      <button type="button" onClick={() => handleRemoveFile(field)} className="text-red-500 hover:text-red-700">
                        <FaTimes />
                      </button>
                    </div>
                  )}
                  <input id={field} type="file" accept=".pdf" className="w-full border-b-2 border-gray-300 p-2 mt-2" onChange={(e) => handleFileChange(field, e)} />
                </div>
              ))}

              <div className="col-span-2 flex justify-center mt-8">
                <button type="submit" className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB]"> Simpan </button>
              </div>
            </form>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default CreateSertifikat;
