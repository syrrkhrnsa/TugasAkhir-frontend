import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaFilePdf, FaTimes, FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import config from "../config";
import { getRoleId } from "../utils/Auth";

const CreateSertifikat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { idTanah } = location.state || {};
  const roleId = getRoleId();

  const [formData, setFormData] = useState({
    jenis_sertifikat: "BASTW",
    status_pengajuan: "Diproses",
    tanggal_pengajuan: new Date().toISOString().split("T")[0],
    id_tanah: idTanah || "",
  });

  const API_URL = config.API_URL;

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [tanahOptions, setTanahOptions] = useState([]);
  const [isLoadingTanah, setIsLoadingTanah] = useState(false);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);

  useEffect(() => {
    if (!idTanah) {
      fetchTanahOptions();
    }
  }, []);

  const fetchTanahOptions = async () => {
    setIsLoadingTanah(true);
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(`${API_URL}/tanah`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTanahOptions(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tanah options:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengambil data tanah",
      });
    } finally {
      setIsLoadingTanah(false);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // File validation
    if (selectedFile.size > 5 * 1024 * 1024) {
      Swal.fire("Error", "Ukuran file maksimal 5MB", "error");
      return;
    }

    if (selectedFile.type !== "application/pdf") {
      Swal.fire("Error", "Hanya file PDF yang diperbolehkan", "error");
      return;
    }

    setFile(selectedFile);
    setUploadedFileInfo(null); // Reset uploaded file info
    setErrors((prev) => ({ ...prev, dokumen: undefined }));
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadedFileInfo(null);
    const fileInput = document.getElementById("dokumen");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

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
    } else if (new Date(formData.tanggal_pengajuan) > new Date()) {
      newErrors.tanggal_pengajuan = "Tanggal tidak boleh melebihi hari ini";
      isValid = false;
    }

    if (!formData.id_tanah) {
      newErrors.id_tanah = "ID Tanah wajib dipilih";
      isValid = false;
    }

    if (!uploadedFileInfo && !file) {
      newErrors.dokumen = "Dokumen wajib diupload";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const uploadFileToMinIO = async () => {
    const token = localStorage.getItem("token");
    const uploadForm = new FormData();
    uploadForm.append("dokumen", file);

    try {
      const response = await axios.post(
        `${API_URL}/upload-dokumen`,
        uploadForm,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        setUploadedFileInfo(response.data.data);
        return response.data.data;
      }
      throw new Error(response.data.message || "Gagal mengupload dokumen");
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const saveSertifikatData = async (fileInfo) => {
    const token = localStorage.getItem("token");

    const payload = {
      jenis_sertifikat: formData.jenis_sertifikat,
      status_pengajuan: formData.status_pengajuan,
      tanggal_pengajuan: formData.tanggal_pengajuan,
      id_tanah: formData.id_tanah,
      dokumen_path: fileInfo.filename,
    };

    try {
      const response = await axios.post(`${API_URL}/sertifikat`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return response.data;
    } catch (error) {
      console.error("Save error:", error);

      // Hapus file yang sudah terupload jika simpan data gagal
      if (fileInfo?.filename) {
        try {
          await axios.delete(`${API_URL}/delete-dokumen`, {
            data: { filename: fileInfo.filename },
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (deleteError) {
          console.error("Gagal menghapus file:", deleteError);
        }
      }

      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    let fileInfo = uploadedFileInfo;

    try {
      // Jika file belum diupload, upload terlebih dahulu
      if (!uploadedFileInfo && file) {
        fileInfo = await uploadFileToMinIO();
      }

      // Simpan data sertifikat
      const response = await saveSertifikatData(fileInfo);

      // Handle success response
      let successMessage = "Sertifikat berhasil dibuat";
      if (roleId === "326f0dde-2851-4e47-ac5a-de6923447317") {
        successMessage =
          "Permintaan telah dikirim ke Bidgar Wakaf untuk ditinjau";
      }

      Swal.fire({
        title: "Sukses!",
        text: successMessage,
        icon: "success",
        willClose: () => {
          navigate(`/sertifikat`);
        },
      });
    } catch (error) {
      console.error("Error details:", error);

      let errorMessage = "Terjadi kesalahan saat menyimpan data";
      let errorDetails = "";

      if (error.response) {
        // Handle validation errors
        if (error.response.status === 422) {
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
        } else {
          errorMessage = error.response.data.message || errorMessage;
          errorDetails = error.response.data.error || "";
        }
      } else if (error.request) {
        errorMessage = "Tidak ada response dari server";
        errorDetails = "Periksa koneksi internet Anda";
      } else {
        errorMessage = error.message || errorMessage;
      }

      Swal.fire({
        title: "Error",
        html: `<div>${errorMessage}</div>${
          errorDetails ? `<div class="text-sm mt-2">${errorDetails}</div>` : ""
        }`,
        icon: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      <Sidebar>
        <div className="p-4 md:p-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-center mb-8">
              <span className="text-yellow-500">Buat</span>{" "}
              <span className="text-green-700">Sertifikat Baru</span>
            </h1>

            {!formData.id_tanah && !isLoadingTanah && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                <p>
                  Warning: ID Tanah tidak ditemukan. Pastikan Anda mengakses
                  halaman ini dari detail tanah atau pilih tanah dari daftar.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Tanah (jika tidak dari detail tanah) */}
                {!idTanah && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pilih Tanah <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.id_tanah ? "border-red-500" : "border-gray-300"
                      } ${isLoadingTanah ? "bg-gray-100" : ""}`}
                      value={formData.id_tanah}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          id_tanah: e.target.value,
                        })
                      }
                      disabled={isLoadingTanah}
                    >
                      <option value="">Pilih Tanah</option>
                      {tanahOptions.map((tanah) => (
                        <option key={tanah.id_tanah} value={tanah.id_tanah}>
                          {tanah.nama_tanah || `Tanah ${tanah.id_tanah}`}
                        </option>
                      ))}
                    </select>
                    {errors.id_tanah && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.id_tanah}
                      </p>
                    )}
                    {isLoadingTanah && (
                      <p className="mt-1 text-sm text-gray-500">
                        Memuat data tanah...
                      </p>
                    )}
                  </div>
                )}

                {/* Jenis Sertifikat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Sertifikat <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-md ${
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
                    <option value="BASTW">
                      Berita Acara Serah Terima Wakaf (BASTW)
                    </option>
                    <option value="AIW">Akta Ikrar Wakaf (AIW)</option>
                    <option value="SW">Sertifikat Wakaf (SW)</option>
                  </select>
                  {errors.jenis_sertifikat && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.jenis_sertifikat}
                    </p>
                  )}
                </div>

                {/* Status Pengajuan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Pengajuan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-3 py-2 border rounded-md ${
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.status_pengajuan}
                    </p>
                  )}
                </div>

                {/* Tanggal Pengajuan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Pengajuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    className={`w-full px-3 py-2 border rounded-md ${
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
                    <p className="mt-1 text-sm text-red-600">
                      {errors.tanggal_pengajuan}
                    </p>
                  )}
                </div>

                {/* Dokumen Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dokumen Sertifikat (PDF){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 flex items-center">
                    <label
                      htmlFor="dokumen"
                      className={`cursor-pointer bg-white py-2 px-3 border rounded-md shadow-sm text-sm leading-4 font-medium ${
                        uploadedFileInfo
                          ? "border-green-500 text-green-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      } focus:outline-none`}
                    >
                      {uploadedFileInfo ? "File Sudah Diupload" : "Pilih File"}
                    </label>
                    <input
                      id="dokumen"
                      name="dokumen"
                      type="file"
                      accept=".pdf"
                      className="sr-only"
                      onChange={handleFileChange}
                      disabled={!!uploadedFileInfo}
                    />
                    {(file || uploadedFileInfo) && (
                      <div className="ml-4 flex items-center">
                        <FaFilePdf className="text-red-500 mr-2" />
                        <span className="text-sm text-gray-700">
                          {uploadedFileInfo?.filename || file.name} (
                          {uploadedFileInfo
                            ? "Terverifikasi"
                            : `${(file.size / 1024 / 1024).toFixed(2)} MB`}
                          )
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </div>
                  {errors.dokumen && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dokumen}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    Unggah dokumen PDF (maksimal 5MB)
                  </p>
                  {uploadedFileInfo && (
                    <p className="mt-1 text-sm text-green-600">
                      File sudah berhasil diupload ke server
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.id_tanah}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    isSubmitting || !formData.id_tanah
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      Menyimpan...
                    </span>
                  ) : (
                    "Simpan"
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

export default CreateSertifikat;
