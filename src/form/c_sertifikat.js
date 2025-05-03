import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const CreateSertifikat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { idTanah } = location.state || {};

  const [formData, setFormData] = useState({
    jenis_sertifikat: "BASTW",
    status_pengajuan: "Diproses",
    tanggal_pengajuan: new Date().toISOString().split("T")[0],
    id_tanah: idTanah,
  });

  const [filePreviews, setFilePreviews] = useState({ dokumen: null });
  const [files, setFiles] = useState({ dokumen: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    jenis_sertifikat: "",
    status_pengajuan: "",
    tanggal_pengajuan: "",
  });

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "Ukuran file maksimal 5MB", "error");
      return;
    }

    if (!file.type.includes("pdf")) {
      Swal.fire("Error", "Hanya file PDF yang diperbolehkan", "error");
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
    const newErrors = {
      jenis_sertifikat: "",
      status_pengajuan: "",
      tanggal_pengajuan: "",
    };

    if (!formData.jenis_sertifikat) {
      newErrors.jenis_sertifikat = "Jenis sertifikat wajib diisi";
      isValid = false;
    }

    if (!formData.status_pengajuan) {
      newErrors.status_pengajuan = "Status pengajuan wajib diisi";
      isValid = false;
    }

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

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("jenis_sertifikat", formData.jenis_sertifikat);
      formDataToSend.append("status_pengajuan", formData.status_pengajuan);
      formDataToSend.append("tanggal_pengajuan", formData.tanggal_pengajuan);
      formDataToSend.append("id_tanah", formData.id_tanah);

      if (files.dokumen) {
        formDataToSend.append("dokumen", files.dokumen);
      }

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

      Swal.fire("Success!", "Sertifikat berhasil dibuat", "success");
      navigate(`/tanah/edit/${formData.id_tanah}`);
    } catch (error) {
      console.error("Error:", error.response?.data);
      let errorMessage = error.response?.data?.message || "Terjadi kesalahan";

      if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors)
          .flat()
          .join("\n");
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
              <span className="text-[#FECC23]">Dokumen</span>{" "}
              <span className="text-[#187556]">Baru</span>
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid grid-cols-2 gap-8"
            >
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
                    setFormData({
                      ...formData,
                      jenis_sertifikat: e.target.value,
                    })
                  }
                >
                  <option value="BASTW">BASTW</option>
                  <option value="AIW">AIW</option>
                  <option value="SW">Sertifikat Wakaf (SW)</option>
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
                    setFormData({
                      ...formData,
                      status_pengajuan: e.target.value,
                    })
                  }
                >
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
                    setFormData({
                      ...formData,
                      tanggal_pengajuan: e.target.value,
                    })
                  }
                  max={new Date().toISOString().split("T")[0]}
                />
                {errors.tanggal_pengajuan && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.tanggal_pengajuan}
                  </p>
                )}
              </div>

              {/* Dokumen Upload */}
              <div className="col-span-2 flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Dokumen Sertifikat (PDF)
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
                    Dokumen PDF (Opsional, maksimal 5MB)
                  </p>
                )}
                <input
                  id="dokumen"
                  type="file"
                  accept=".pdf"
                  className="w-full border-b-2 border-gray-300 p-2 mt-2"
                  onChange={(e) => handleFileChange("dokumen", e)}
                />
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

export default CreateSertifikat;
