import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const CreateSertifikat = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get id_tanah from navigation state
  const { idTanah } = location.state || {};

  // State untuk data form
  const [formData, setFormData] = useState({
    no_dokumen: "",
    jenis_sertifikat: "",
    status_pengajuan: "",
    tanggal_pengajuan: new Date().toISOString().split("T")[0],
    id_tanah: idTanah,
  });

  // State untuk validasi
  const [errors, setErrors] = useState({
    jenis_sertifikat: "",
    status_pengajuan: "",
    tanggal_pengajuan: "",
    dokumen: "",
  });

  // State untuk file upload dan preview
  const [filePreviews, setFilePreviews] = useState({ dokumen: null });
  const [files, setFiles] = useState({ dokumen: null });

  // Validasi form
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      jenis_sertifikat: "",
      status_pengajuan: "",
      tanggal_pengajuan: "",
      dokumen: "",
    };

    // Validasi jenis sertifikat
    if (!formData.jenis_sertifikat) {
      newErrors.jenis_sertifikat = "Jenis sertifikat wajib diisi";
      isValid = false;
    }

    // Validasi status pengajuan
    if (!formData.status_pengajuan) {
      newErrors.status_pengajuan = "Status pengajuan wajib diisi";
      isValid = false;
    }

    // Validasi tanggal pengajuan
    if (!formData.tanggal_pengajuan) {
      newErrors.tanggal_pengajuan = "Tanggal pengajuan wajib diisi";
      isValid = false;
    } else {
      const inputDate = new Date(formData.tanggal_pengajuan);
      const today = new Date();

      if (inputDate > today) {
        newErrors.tanggal_pengajuan = "Tanggal tidak boleh melebihi hari ini";
        isValid = false;
      }
    }

    // Validasi dokumen (optional, sesuaikan kebutuhan)
    if (!files.dokumen) {
      newErrors.dokumen = "Dokumen wajib diupload";
      isValid = false;
    } else if (files.dokumen.size > 5 * 1024 * 1024) {
      // 5MB max
      newErrors.dokumen = "Ukuran file maksimal 5MB";
      isValid = false;
    } else if (!files.dokumen.type.includes("pdf")) {
      newErrors.dokumen = "Hanya file PDF yang diperbolehkan";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle file change untuk preview
  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi file
    if (file.size > 5 * 1024 * 1024) {
      setErrors({
        ...errors,
        dokumen: "Ukuran file maksimal 5MB",
      });
      return;
    }

    if (!file.type.includes("pdf")) {
      setErrors({
        ...errors,
        dokumen: "Hanya file PDF yang diperbolehkan",
      });
      return;
    }

    setFiles((prev) => ({ ...prev, [field]: file }));
    setFilePreviews((prev) => ({
      ...prev,
      [field]: URL.createObjectURL(file),
    }));
    setErrors({ ...errors, dokumen: "" });
  };

  // Hapus file yang dipilih
  const handleRemoveFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setFilePreviews((prev) => ({ ...prev, [field]: null }));
    document.getElementById(field).value = "";
    setErrors({ ...errors, dokumen: "Dokumen wajib diupload" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Harap periksa kembali form yang diisi",
        confirmButtonText: "Mengerti",
      });
      return;
    }

    if (!formData.id_tanah) {
      Swal.fire({
        icon: "error",
        title: "Data Tanah Tidak Valid",
        text: "ID tanah tidak ditemukan",
        confirmButtonText: "OK",
      });
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "warning",
        title: "Akses Ditolak",
        text: "Anda harus login terlebih dahulu",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    const formDataToSend = new FormData();

    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    // Append file if exists
    if (files.dokumen) {
      formDataToSend.append("dokumen", files.dokumen);
    }

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/sertifikat",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: response.data.message,
          confirmButtonText: "OK",
        }).then(() => {
          navigate(`/tanah/edit/${formData.id_tanah}`);
        });
      }
    } catch (error) {
      console.error("Error creating sertifikat:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Membuat Sertifikat",
        text: error.response?.data?.message || error.message,
        confirmButtonText: "Mengerti",
      });
    }
  };

  // Handle input change dengan validasi
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // Clear error ketika field diisi
    if (value && errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl">
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Buat Sertifikat Baru</span>
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid grid-cols-2 gap-8"
            >
              {/* No Dokumen */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  No Dokumen
                </label>
                <input
                  type="text"
                  className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                  value={formData.no_dokumen}
                  onChange={(e) =>
                    handleInputChange("no_dokumen", e.target.value)
                  }
                />
              </div>

              {/* Tanggal Pengajuan */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Tanggal Pengajuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`w-full border-b-2 p-2 focus:outline-none ${
                    errors.tanggal_pengajuan
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formData.tanggal_pengajuan}
                  onChange={(e) =>
                    handleInputChange("tanggal_pengajuan", e.target.value)
                  }
                  max={new Date().toISOString().split("T")[0]} // Tidak boleh lebih dari hari ini
                  required
                />
                {errors.tanggal_pengajuan && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tanggal_pengajuan}
                  </p>
                )}
              </div>

              {/* Jenis Sertifikat */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Jenis Sertifikat <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full border-b-2 p-2 focus:outline-none ${
                    errors.jenis_sertifikat
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formData.jenis_sertifikat}
                  onChange={(e) =>
                    handleInputChange("jenis_sertifikat", e.target.value)
                  }
                  required
                >
                  <option value="">Pilih Jenis Sertifikat</option>
                  <option value="BASTW">BASTW</option>
                  <option value="AIW">AIW</option>
                  <option value="SW">SW</option>
                </select>
                {errors.jenis_sertifikat && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.jenis_sertifikat}
                  </p>
                )}
              </div>

              {/* Status Pengajuan */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Status Pengajuan <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full border-b-2 p-2 focus:outline-none ${
                    errors.status_pengajuan
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formData.status_pengajuan}
                  onChange={(e) =>
                    handleInputChange("status_pengajuan", e.target.value)
                  }
                  required
                >
                  <option value="">Pilih Status</option>
                  <option value="Diproses">Diproses</option>
                  <option value="Terbit">Terbit</option>
                  <option value="Ditolak">Ditolak</option>
                </select>
                {errors.status_pengajuan && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.status_pengajuan}
                  </p>
                )}
              </div>

              {/* Dokumen Upload */}
              <div className="col-span-2 flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Dokumen Sertifikat (PDF){" "}
                  <span className="text-red-500">*</span>
                </label>
                {filePreviews.dokumen ? (
                  <div className="mt-2 flex items-center gap-2">
                    <a
                      href={filePreviews.dokumen}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 flex items-center"
                    >
                      <FaEye className="mr-1" /> Lihat Preview
                    </a>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile("dokumen")}
                      className="text-red-500 hover:text-red-700 flex items-center"
                    >
                      <FaTimes className="mr-1" /> Hapus
                    </button>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm italic mt-1">
                    Belum ada dokumen yang diupload
                  </p>
                )}
                <input
                  id="dokumen"
                  type="file"
                  accept=".pdf"
                  className={`w-full border-b-2 p-2 mt-2 ${
                    errors.dokumen ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={(e) => handleFileChange("dokumen", e)}
                  required
                />
                {errors.dokumen && (
                  <p className="text-red-500 text-xs mt-1">{errors.dokumen}</p>
                )}
              </div>

              <div className="col-span-2 flex justify-center mt-8 gap-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB] transition-colors"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default CreateSertifikat;
