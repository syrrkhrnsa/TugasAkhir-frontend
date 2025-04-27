import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const CreateFasilitas = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jenis_fasilitas: "",
    nama_fasilitas: "",
    catatan: "",
    lokasi: "",
  });

  const [files, setFiles] = useState({
    view360: null,
    gambarFasilitas: null,
    dokumenPdf: null,
  });

  const [filePreviews, setFilePreviews] = useState({
    view360: null,
    gambarFasilitas: null,
    dokumenPdf: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxFileSize) {
      Swal.fire("Error", "Ukuran file maksimal 5MB", "error");
      return;
    }

    if (field === "dokumenPdf" && !file.type.includes("pdf")) {
      Swal.fire("Error", "Unggahan dokumen harus file PDF", "error");
      return;
    }

    if ((field === "view360" || field === "gambarFasilitas") && !file.type.startsWith("image/")) {
      Swal.fire("Error", "Unggahan harus berupa gambar", "error");
      return;
    }

    setFiles({ ...files, [field]: file });
    setFilePreviews({ ...filePreviews, [field]: URL.createObjectURL(file) });
  };

  const handleRemoveFile = (field) => {
    setFiles({ ...files, [field]: null });
    setFilePreviews({ ...filePreviews, [field]: null });
    document.getElementById(field).value = "";
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.jenis_fasilitas) {
      newErrors.jenis_fasilitas = "Jenis fasilitas wajib diisi";
      isValid = false;
    }
    if (!formData.nama_fasilitas) {
      newErrors.nama_fasilitas = "Nama fasilitas wajib diisi";
      isValid = false;
    }
    if (!formData.lokasi) {
      newErrors.lokasi = "Lokasi wajib diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("jenis_fasilitas", formData.jenis_fasilitas);
      formDataToSend.append("nama_fasilitas", formData.nama_fasilitas);
      formDataToSend.append("catatan", formData.catatan);
      formDataToSend.append("lokasi", formData.lokasi);

      if (files.view360) {
        formDataToSend.append("view360", files.view360);
      }
      if (files.gambarFasilitas) {
        formDataToSend.append("gambarFasilitas", files.gambarFasilitas);
      }
      if (files.dokumenPdf) {
        formDataToSend.append("dokumenPdf", files.dokumenPdf);
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/fasilitas",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      Swal.fire("Success!", "Fasilitas berhasil dibuat", "success");
      navigate("/fasilitas");
    } catch (error) {
      console.error("Error:", error.response?.data);
      let errorMessage = error.response?.data?.message || "Terjadi kesalahan";

      if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).flat().join("\n");
      }

      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl">
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Fasilitas</span>{" "}
              <span className="text-[#187556]">Baru</span>
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-3 gap-8">
                {/* Form Field 2 kolom */}
                <div className="flex flex-col">
                    {/* Jenis Fasilitas */}
                    <label className="text-sm font-medium text-gray-400">
                    Jenis Fasilitas <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="text"
                    className={`w-full border-b-2 p-2 focus:outline-none ${errors.jenis_fasilitas ? "border-red-500" : "border-gray-300"}`}
                    value={formData.jenis_fasilitas}
                    onChange={(e) => setFormData({ ...formData, jenis_fasilitas: e.target.value })}
                    />
                    {errors.jenis_fasilitas && <p className="text-red-500 text-xs mt-1">{errors.jenis_fasilitas}</p>}
                </div>

                <div className="flex flex-col">
                    {/* Nama Fasilitas */}
                    <label className="text-sm font-medium text-gray-400">
                    Nama Fasilitas <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="text"
                    className={`w-full border-b-2 p-2 focus:outline-none ${errors.nama_fasilitas ? "border-red-500" : "border-gray-300"}`}
                    value={formData.nama_fasilitas}
                    onChange={(e) => setFormData({ ...formData, nama_fasilitas: e.target.value })}
                    />
                    {errors.nama_fasilitas && <p className="text-red-500 text-xs mt-1">{errors.nama_fasilitas}</p>}
                </div>

                <div className="flex flex-col">
                    {/* Nama Fasilitas */}
                    <label className="text-sm font-medium text-gray-400">
                    Kategori Fasilitas <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="text"
                    className={`w-full border-b-2 p-2 focus:outline-none ${errors.kategori_fasilitas ? "border-red-500" : "border-gray-300"}`}
                    value={formData.kategori_fasilitas}
                    onChange={(e) => setFormData({ ...formData, kategori_fasilitas: e.target.value })}
                    />
                    {errors.kategori_fasilitas && <p className="text-red-500 text-xs mt-1">{errors.kategori_fasilitas}</p>}
                </div>

                <div className="flex flex-col col-span-3">
                    {/* Catatan */}
                    <label className="text-sm font-medium text-gray-400">Catatan</label>
                    <textarea
                    className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                    value={formData.catatan}
                    onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                    rows="3"
                    ></textarea>
                </div>

                {/* Upload File dalam 1 baris */}
                <div className="col-span-3">
                <div className="flex gap-8">
                    <div className="flex-1">
                    <UploadFile
                        field="view360"
                        label="Unggah View 360 (gambar)"
                        preview={filePreviews.view360}
                        onChange={handleFileChange}
                        onRemove={handleRemoveFile}
                    />
                    </div>
                    <div className="flex-1">
                    <UploadFile
                        field="gambarFasilitas"
                        label="Unggah Gambar Fasilitas"
                        preview={filePreviews.gambarFasilitas}
                        onChange={handleFileChange}
                        onRemove={handleRemoveFile}
                    />
                    </div>
                    <div className="flex-1">
                    <UploadFile
                        field="dokumenPdf"
                        label="Unggah PDF"
                        preview={filePreviews.dokumenPdf}
                        onChange={handleFileChange}
                        onRemove={handleRemoveFile}
                    />
                    </div>
                </div>
                </div>

                {/* Tombol */}
                <div className="col-span-3 flex justify-center mt-8 gap-4">
                    <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                    >
                    Batal
                    </button>
                    <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB] transition-colors disabled:opacity-50"
                    >
                    {isSubmitting ? "Menyimpan..." : "Simpan"}
                    </button>
                </div>
                </form>

          </div>
        </div>
      </Sidebar>
    </div>
  );
};

const UploadFile = ({ field, label, preview, onChange, onRemove }) => (
  <div className="flex flex-col col-span-2">
    <label className="text-sm font-medium text-gray-400">{label}</label>
    {preview ? (
      <div className="mt-2 flex items-center gap-2">
        <a
          href={preview}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <FaEye className="mr-1" /> Lihat Preview
        </a>
        <button
          type="button"
          onClick={() => onRemove(field)}
          className="text-red-500 hover:text-red-700 flex items-center"
        >
          <FaTimes className="mr-1" /> Hapus
        </button>
      </div>
    ) : (
      <p className="text-gray-400 text-sm italic mt-1">Maksimal ukuran 5MB</p>
    )}
    <input
      id={field}
      type="file"
      accept={field === "dokumenPdf" ? ".pdf" : "image/*"}
      className="w-full border-b-2 border-gray-300 p-2 mt-2"
      onChange={(e) => onChange(field, e)}
    />
  </div>
);

export default CreateFasilitas;
