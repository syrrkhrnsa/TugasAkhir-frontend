import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import {
  FaEye,
  FaTimes,
  FaSave,
  FaArrowLeft,
  FaSpinner,
  FaTrash,
} from "react-icons/fa";
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
  const token = localStorage.getItem("token");

  const [existingDocuments, setExistingDocuments] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalData, setOriginalData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [documentsToDelete, setDocumentsToDelete] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchSertifikat();
    fetchDocuments();
  }, [id]);

  const fetchSertifikat = async () => {
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
      }
    } catch (error) {
      console.error("Error fetching sertifikat:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengambil data sertifikat",
      }).then(() => {
        navigate("/dashboard");
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/sertifikat/${id}/dokumen-list`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExistingDocuments(response.data.data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal mengambil dokumen",
        text: "Terjadi kesalahan saat mengambil daftar dokumen",
      });
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const validFiles = newFiles.filter((file) => {
      const isValidType = file.type === "application/pdf";
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType) {
        Swal.fire({
          icon: "error",
          title: "Format tidak valid",
          text: `${file.name} bukan file PDF`,
        });
        return false;
      }

      if (!isValidSize) {
        Swal.fire({
          icon: "error",
          title: "File terlalu besar",
          text: `${file.name} melebihi 5MB`,
        });
        return false;
      }

      return true;
    });

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveNewFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkForDeletion = (docId) => {
    if (documentsToDelete.includes(docId)) {
      setDocumentsToDelete((prev) => prev.filter((id) => id !== docId));
    } else {
      setDocumentsToDelete((prev) => [...prev, docId]);
    }
  };

  const confirmDelete = async () => {
    const result = await Swal.fire({
      title: "Anda yakin?",
      text: `Akan menghapus ${documentsToDelete.length} dokumen`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      await handleDeleteDocuments();
    }
  };

  const handleDeleteDocuments = async () => {
    setIsDeleting(true);
    try {
      const deleteResults = await Promise.allSettled(
        documentsToDelete.map((docId) =>
          axios.delete(`${API_URL}/dokumen-legalitas/${docId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      const failedDeletes = deleteResults.filter(
        (result) => result.status === "rejected"
      );

      if (failedDeletes.length > 0) {
        console.error("Failed deletes:", failedDeletes);
        Swal.fire({
          icon: "warning",
          title: "Peringatan",
          text: "Beberapa dokumen mungkin sudah terhapus",
        });
      }

      // Optimistic update
      setExistingDocuments((prev) =>
        prev.filter((doc) => !documentsToDelete.includes(doc.id))
      );
      setDocumentsToDelete([]);

      // Refresh data from server
      await fetchDocuments();
    } catch (error) {
      console.error("Error deleting documents:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menghapus dokumen",
      });
    } finally {
      setIsDeleting(false);
    }
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

    try {
      // Handle document deletions first
      if (documentsToDelete.length > 0) {
        await confirmDelete();
      }

      // Handle new file uploads
      if (files.length > 0) {
        const formDataToSend = new FormData();
        files.forEach((file) => formDataToSend.append("dokumen[]", file));

        await axios.post(
          `${API_URL}/sertifikat/${id}/upload-dokumen`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      // Update sertifikat data
      await axios.put(
        `${API_URL}/sertifikat/${id}`,
        {
          no_dokumen: formData.no_dokumen || null, // Send null if empty
          tanggal_pengajuan: formData.tanggal_pengajuan,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data sertifikat berhasil diperbarui",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        navigate(`/tanah/detail/${formData.id_tanah}`);
      });
    } catch (error) {
      console.error("Error updating sertifikat:", error);
      let errorMsg = "Gagal memperbarui sertifikat";

      if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMsg = Object.values(error.response.data.errors).join("\n");
      }

      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: errorMsg,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Dokumen (Opsional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#187556]"
                    value={formData.no_dokumen}
                    onChange={(e) =>
                      setFormData({ ...formData, no_dokumen: e.target.value })
                    }
                    placeholder="Kosongkan jika tidak ada"
                  />
                </div>

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

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Dokumen Legalitas
                </h3>

                {existingDocuments.length > 0 ? (
                  <div className="space-y-3">
                    {existingDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={documentsToDelete.includes(doc.id)}
                            onChange={() => handleMarkForDeletion(doc.id)}
                            className="mr-3 h-4 w-4 text-[#187556] focus:ring-[#187556] border-gray-300 rounded"
                            disabled={isDeleting}
                          />
                          <span
                            className={`${
                              documentsToDelete.includes(doc.id)
                                ? "line-through text-gray-400"
                                : "text-gray-700"
                            }`}
                          >
                            {doc.name}
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <FaEye className="h-5 w-5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleMarkForDeletion(doc.id)}
                            className={`${
                              documentsToDelete.includes(doc.id)
                                ? "text-green-500 hover:text-green-700"
                                : "text-red-500 hover:text-red-700"
                            }`}
                            disabled={isDeleting}
                          >
                            {documentsToDelete.includes(doc.id) ? (
                              <FaTimes className="h-5 w-5" />
                            ) : (
                              <FaTrash className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Belum ada dokumen</p>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Tambah Dokumen Baru
                </h3>

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
                        <span className="font-semibold">Klik untuk upload</span>{" "}
                        atau drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PDF (MAX. 5MB per file)
                      </p>
                    </div>
                    <input
                      id="dokumen"
                      type="file"
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".pdf"
                      multiple
                      disabled={isSubmitting}
                    />
                  </label>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <span className="text-sm text-gray-700 truncate max-w-xs">
                          {file.name} ({(file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveNewFile(index)}
                          className="text-red-500 hover:text-red-700"
                          disabled={isSubmitting}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => navigate(`/tanah/detail/${formData.id_tanah}`)}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556]"
                  disabled={isSubmitting}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isDeleting}
                  className={`px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-[#187556] hover:bg-[#146347] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556] ${
                    isSubmitting || isDeleting ? "opacity-75" : ""
                  }`}
                >
                  {isSubmitting || isDeleting ? (
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
