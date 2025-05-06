import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes, FaSave, FaArrowLeft, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import { getRoleId } from "../utils/Auth";
import config from "../config";

const EditSertifikat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const roleId = getRoleId();
  const isPimpinanJamaah = roleId === "326f0dde-2851-4e47-ac5a-de6923447317";

  const [formData, setFormData] = useState({
    no_dokumen: "",
    tanggal_pengajuan: "",
    id_tanah: "",
    status: "ditinjau",
  });

  const API_URL = config.API_URL;

  const [filePreviews, setFilePreviews] = useState({ dokumen: null });
  const [files, setFiles] = useState({ dokumen: null });
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchSertifikat();
  }, [id]);

  const fetchSertifikat = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const response = await axios.get(`${API_URL}/sertifikat/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const sertifikat = response.data.data || response.data;
      if (sertifikat) {
        setOriginalData(sertifikat);
        setFormData({
          no_dokumen: sertifikat.no_dokumen || "",
          tanggal_pengajuan: sertifikat.tanggal_pengajuan
            ? sertifikat.tanggal_pengajuan.split("T")[0]
            : "",
          id_tanah: sertifikat.id_tanah || "",
          status: sertifikat.status || "ditinjau",
        });

        if (sertifikat.dokumen_url) {
          setFilePreviews({ dokumen: sertifikat.dokumen_url });
        }
      }
    } catch (error) {
      console.error("Error fetching sertifikat:", error);

      let errorMessage = "Gagal mengambil data sertifikat";
      if (error.response?.status === 404) {
        errorMessage = "Sertifikat tidak ditemukan";
      } else if (error.response?.status === 403) {
        errorMessage = "Anda tidak memiliki akses ke data ini";
      }

      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      }).then(() => {
        navigate("/dashboard");
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = ["application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Format tidak valid",
        text: "Hanya file PDF yang diperbolehkan",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File terlalu besar",
        text: "Ukuran file maksimal 5MB",
      });
      return;
    }

    setFiles({ ...files, [field]: file });
    setFilePreviews({ ...filePreviews, [field]: URL.createObjectURL(file) });
    setErrors((prev) => ({ ...prev, dokumen: undefined }));
  };

  const handleRemoveFile = (field) => {
    setFiles({ ...files, [field]: null });
    setFilePreviews({ ...filePreviews, [field]: null });
    document.getElementById(field).value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.tanggal_pengajuan) {
      newErrors.tanggal_pengajuan = "Tanggal pengajuan wajib diisi";
      isValid = false;
    } else if (new Date(formData.tanggal_pengajuan) > new Date()) {
      newErrors.tanggal_pengajuan = "Tanggal tidak boleh melebihi hari ini";
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

    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Anda harus login terlebih dahulu",
      });
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("_method", "PUT");

    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataToSend.append(key, value);
      }
    });

    // Append file if changed
    if (files.dokumen) {
      formDataToSend.append("dokumen", files.dokumen);
    }

    try {
      const response = await axios.post(
        `${API_URL}/sertifikat/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle success based on response status
      const successMessage =
        response.status === 202
          ? "Perubahan menunggu persetujuan Bidgar Wakaf"
          : "Data sertifikat berhasil diperbarui";

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: successMessage,
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        navigate(`/tanah/detail/${formData.id_tanah}`);
      });
    } catch (error) {
      console.error("Error updating sertifikat:", error);

      let errorMessage = "Gagal memperbarui sertifikat";
      let errorDetails = "";

      if (error.response) {
        if (error.response.status === 422) {
          // Handle validation errors
          const backendErrors = error.response.data.errors;
          setErrors((prev) => ({
            ...prev,
            ...Object.fromEntries(
              Object.entries(backendErrors).map(([key, value]) => [
                key,
                value[0],
              ])
            ),
          }));
          errorMessage = "Validasi gagal";
          errorDetails = "Periksa kembali form Anda";
        } else if (error.response.status === 403) {
          errorMessage =
            "Anda tidak memiliki izin untuk melakukan tindakan ini";
        } else {
          errorMessage = error.response.data.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = "Tidak ada response dari server";
        errorDetails = "Periksa koneksi internet Anda";
      }

      Swal.fire({
        icon: "error",
        title: "Gagal",
        html: `<div>${errorMessage}</div>${
          errorDetails ? `<div class="text-sm mt-2">${errorDetails}</div>` : ""
        }`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const FilePreview = ({ field, label }) => (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      {filePreviews[field] && (
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.open(filePreviews[field], "_blank")}
            className="flex items-center text-blue-500 hover:text-blue-700 text-sm"
          >
            <FaEye className="mr-1" /> Lihat Dokumen
          </button>
          <button
            type="button"
            onClick={() => handleRemoveFile(field)}
            className="flex items-center text-red-500 hover:text-red-700 text-sm"
          >
            <FaTimes className="mr-1" /> Hapus
          </button>
        </div>
      )}

      <div className="mt-2">
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg
              className="w-8 h-8 mb-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 16"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Klik untuk upload</span> atau drag
              and drop
            </p>
            <p className="text-xs text-gray-500">
              {files.dokumen
                ? `${files.dokumen.name} (${(
                    files.dokumen.size /
                    1024 /
                    1024
                  ).toFixed(2)} MB)`
                : originalData?.dokumen_url
                ? "Dokumen sudah ada"
                : "PDF (MAX. 5MB)"}
            </p>
          </div>
          <input
            id={field}
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(field, e)}
            accept=".pdf"
          />
        </label>
      </div>
      {errors.dokumen && (
        <p className="mt-1 text-sm text-red-600">{errors.dokumen}</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="relative">
        <Sidebar>
          <div className="flex-1 p-4">
            <div className="bg-white shadow-lg rounded-lg p-8 mx-auto w-[90%] max-w-4xl">
              <div className="flex justify-center items-center h-64">
                <FaSpinner className="animate-spin text-4xl text-[#187556]" />
              </div>
            </div>
          </div>
        </Sidebar>
      </div>
    );
  }

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg p-6 md:p-8 mx-auto w-[90%] max-w-4xl">
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
              >
                <FaArrowLeft className="mr-2" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                Edit Sertifikat Wakaf
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* No Dokumen */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Dokumen
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#187556]"
                    value={formData.no_dokumen}
                    onChange={(e) =>
                      setFormData({ ...formData, no_dokumen: e.target.value })
                    }
                  />
                </div>

                {/* Tanggal Pengajuan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pengajuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border ${
                      errors.tanggal_pengajuan
                        ? "border-red-500"
                        : "border-gray-300"
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-[#187556]`}
                    value={formData.tanggal_pengajuan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_pengajuan: e.target.value,
                      })
                    }
                    max={new Date().toISOString().split("T")[0]}
                    required
                  />
                  {errors.tanggal_pengajuan && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.tanggal_pengajuan}
                    </p>
                  )}
                </div>
              </div>

              {/* Dokumen Upload */}
              <div className="mt-4">
                <FilePreview field="dokumen" label="Dokumen Sertifikat" />
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/tanah/detail/${formData.id_tanah}`)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#187556] hover:bg-[#146347] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556] ${
                    isSubmitting ? "opacity-75" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <FaSpinner className="animate-spin mr-2" />
                      {isPimpinanJamaah ? "Mengajukan..." : "Menyimpan..."}
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <FaSave className="mr-2" />
                      {isPimpinanJamaah
                        ? "Ajukan Perubahan"
                        : "Simpan Perubahan"}
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default EditSertifikat;
