import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes, FaTrash, FaSave, FaArrowLeft } from "react-icons/fa";
import Swal from "sweetalert2";
import { getRoleId } from "../utils/Auth";

const EditSertifikat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const roleId = getRoleId();
  const isPimpinanJamaah = roleId === "326f0dde-2851-4e47-ac5a-de6923447317";

  const [formData, setFormData] = useState({
    no_dokumen: "",
    jenis_sertifikat: "",
    status_pengajuan: "",
    tanggal_pengajuan: "",
    id_tanah: "",
    status: "ditinjau",
  });

  const [filePreviews, setFilePreviews] = useState({ dokumen: null });
  const [files, setFiles] = useState({ dokumen: null });
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSertifikat();
  }, []);

  const fetchSertifikat = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/sertifikat/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const sertifikat = response.data.data || response.data;
      if (sertifikat) {
        setOriginalData(sertifikat);
        setFormData({
          no_dokumen: sertifikat.no_dokumen || "",
          jenis_sertifikat: sertifikat.jenis_sertifikat || "",
          status_pengajuan: sertifikat.status_pengajuan || "",
          tanggal_pengajuan: sertifikat.tanggal_pengajuan
            ? sertifikat.tanggal_pengajuan.split("T")[0]
            : "",
          id_tanah: sertifikat.id_tanah || "",
          status: sertifikat.status || "ditinjau",
        });

        if (sertifikat.dokumen) {
          setFilePreviews({
            dokumen: `http://127.0.0.1:8000/storage/${sertifikat.dokumen}`,
          });
        }
      }
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengambil data sertifikat",
      });
      navigate("/dashboard");
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/jpg",
    ];
    if (!allowedTypes.includes(file.type)) {
      Swal.fire({
        icon: "error",
        title: "Format tidak valid",
        text: "Hanya file PDF, JPG, JPEG, atau PNG yang diperbolehkan",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      Swal.fire({
        icon: "error",
        title: "File terlalu besar",
        text: "Ukuran file maksimal 5MB",
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

    // Validate required fields
    if (
      !formData.jenis_sertifikat ||
      !formData.status_pengajuan ||
      !formData.tanggal_pengajuan
    ) {
      Swal.fire({
        icon: "error",
        title: "Data tidak lengkap",
        text: "Harap isi semua field yang wajib diisi",
      });
      setIsSubmitting(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("_method", "PUT");
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    if (files.dokumen) {
      formDataToSend.append("dokumen", files.dokumen);
    }

    try {
      const response = await axios.post(
        `http://127.0.0.1:8000/api/sertifikat/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 202) {
        // Approval needed case
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Perubahan menunggu persetujuan Bidgar Wakaf",
        }).then(() => {
          navigate(`/tanah/edit/${formData.id_tanah}`);
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data sertifikat berhasil diperbarui",
        }).then(() => {
          navigate(`/tanah/edit/${formData.id_tanah}`);
        });
      }
    } catch (error) {
      console.error("Error updating sertifikat:", error);
      let errorMessage = "Gagal memperbarui sertifikat";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 403) {
        errorMessage = "Anda tidak memiliki izin untuk melakukan tindakan ini";
      }

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: errorMessage,
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
                ? files.dokumen.name
                : originalData?.dokumen
                ? "Dokumen sudah ada"
                : "PDF, JPG, PNG (MAX. 5MB)"}
            </p>
          </div>
          <input
            id={field}
            type="file"
            className="hidden"
            onChange={(e) => handleFileChange(field, e)}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </label>
      </div>
    </div>
  );

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg p-8 mx-auto w-[90%] max-w-4xl">
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

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#187556]"></div>
              </div>
            ) : (
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
                        !formData.tanggal_pengajuan
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
                      required
                    />
                    {!formData.tanggal_pengajuan && (
                      <p className="text-red-500 text-xs mt-1">
                        Tanggal pengajuan wajib diisi
                      </p>
                    )}
                  </div>

                  {/* Jenis Sertifikat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Sertifikat <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 border ${
                        !formData.jenis_sertifikat
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-[#187556]`}
                      value={formData.jenis_sertifikat}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          jenis_sertifikat: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Pilih Jenis Sertifikat</option>
                      <option value="BASTW">BASTW</option>
                      <option value="AIW">AIW</option>
                      <option value="SW">Sertifikat Wakaf (SW)</option>
                    </select>
                    {!formData.jenis_sertifikat && (
                      <p className="text-red-500 text-xs mt-1">
                        Jenis sertifikat wajib dipilih
                      </p>
                    )}
                  </div>

                  {/* Status Pengajuan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status Pengajuan <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={`w-full px-3 py-2 border ${
                        !formData.status_pengajuan
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-[#187556]`}
                      value={formData.status_pengajuan}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status_pengajuan: e.target.value,
                        })
                      }
                      required
                    >
                      <option value="">Pilih Status</option>
                      <option value="Diproses">Diproses</option>
                      <option value="Terbit">Terbit</option>
                      <option value="Ditolak">Ditolak</option>
                    </select>
                    {!formData.status_pengajuan && (
                      <p className="text-red-500 text-xs mt-1">
                        Status pengajuan wajib dipilih
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
                    onClick={() => navigate(`/tanah/edit/${formData.id_tanah}`)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556]"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#187556] hover:bg-[#146347] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556] disabled:opacity-50 flex items-center"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        {isPimpinanJamaah ? "Mengajukan..." : "Menyimpan..."}
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        {isPimpinanJamaah
                          ? "Ajukan Perubahan"
                          : "Simpan Perubahan"}
                      </>
                    )}
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
