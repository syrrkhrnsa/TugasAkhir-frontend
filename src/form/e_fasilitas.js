import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes, FaTrash, FaUpload } from "react-icons/fa";
import Swal from "sweetalert2";
import Spinner from "../components/Spinner";

const EditFasilitas = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // State initialization
  const [formData, setFormData] = useState({
    id_fasilitas: "",
    id_pemetaan_fasilitas: "",
    id_tanah: "",
    jenis_fasilitas: "",
    nama_fasilitas: "",
    kategori_fasilitas: "",
    catatan: "",
    lokasi: "",
  });

  const [fileState, setFileState] = useState({
    file_360: { files: [], previews: [], uploaded: [], toDelete: [] },
    file_gambar: { files: [], previews: [], uploaded: [], toDelete: [] },
    file_pdf: { files: [], previews: [], uploaded: [], toDelete: [] },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("info");
  const [uploadProgress, setUploadProgress] = useState({
    file_360: 0,
    file_gambar: 0,
    file_pdf: 0,
  });

  // Configuration
  const MINIO_BASE_URL = "http://127.0.0.1:9000/wakafpersisbanjaran";
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB

  // Allowed file types configuration
  const FILE_CONFIG = {
    file_360: {
      label: "View 360",
      accept: "image/*,video/*",
      types: [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "video/mp4",
        "video/quicktime",
        "video/x-msvideo",
      ],
      extensions: "JPG, JPEG, PNG, MP4, MOV, AVI",
    },
    file_gambar: {
      label: "Gambar Fasilitas",
      accept: "image/*",
      types: ["image/jpeg", "image/jpg", "image/png"],
      extensions: "JPG, JPEG, PNG",
    },
    file_pdf: {
      label: "Dokumen PDF",
      accept: ".pdf",
      types: ["application/pdf"],
      extensions: "PDF",
    },
  };

  // Initialize form data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch fasilitas data
        const fasilitasResponse = await axios.get(
          `http://127.0.0.1:8000/api/fasilitas/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const fasilitasData = fasilitasResponse.data.data;

        // Fetch pemetaan data
        const pemetaanResponse = await axios.get(
          `http://127.0.0.1:8000/api/pemetaan/fasilitas-detail/${fasilitasData.id_pemetaan_fasilitas}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const pemetaanData = pemetaanResponse.data.data;
        const tanahData = pemetaanData.pemetaan_tanah || {};

        setFormData({
          id_fasilitas: fasilitasData.id_fasilitas,
          id_pemetaan_fasilitas: fasilitasData.id_pemetaan_fasilitas,
          id_tanah: fasilitasData.id_tanah,
          jenis_fasilitas: pemetaanData.jenis_fasilitas,
          nama_fasilitas: pemetaanData.nama_fasilitas,
          kategori_fasilitas: pemetaanData.kategori_fasilitas,
          catatan: fasilitasData.catatan,
          lokasi: tanahData.lokasi || "",
        });

        // Fetch files
        const filesResponse = await axios.get(
          `http://127.0.0.1:8000/api/fasilitas/${id}/files`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const filesData = filesResponse.data.data;
        setFileState({
          file_360: {
            files: [],
            previews: [],
            uploaded: filesData.filter((f) => f.jenis_file === "360"),
            toDelete: [],
          },
          file_gambar: {
            files: [],
            previews: [],
            uploaded: filesData.filter((f) => f.jenis_file === "gambar"),
            toDelete: [],
          },
          file_pdf: {
            files: [],
            previews: [],
            uploaded: filesData.filter((f) => f.jenis_file === "dokumen"),
            toDelete: [],
          },
        });
      } catch (error) {
        console.error("Error fetching data:", error);
        Swal.fire("Error", "Gagal memuat data fasilitas", "error");
        navigate("/fasilitas");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // File handling functions
  const handleFileChange = (field, e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;

    const { types, extensions } = FILE_CONFIG[field];
    const validFiles = [];
    const invalidFiles = [];

    selectedFiles.forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (Ukuran melebihi 15MB)`);
        return;
      }

      if (!types.includes(file.type)) {
        invalidFiles.push(
          `${file.name} (Hanya ${extensions} yang diperbolehkan)`
        );
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length) {
      Swal.fire({
        title: "File Tidak Valid",
        html: `File berikut tidak memenuhi syarat:<br><ul><li>${invalidFiles.join(
          "</li><li>"
        )}</li></ul>`,
        icon: "error",
      });
    }

    if (validFiles.length) {
      const newPreviews = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));

      setFileState((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          files: [...prev[field].files, ...validFiles],
          previews: [...prev[field].previews, ...newPreviews],
        },
      }));
    }
  };

  const handleRemoveFile = (field, index, isUploaded = false) => {
    if (isUploaded) {
      // Mark file for deletion instead of deleting immediately
      const fileToDelete = fileState[field].uploaded[index];
      setFileState((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          toDelete: [...prev[field].toDelete, fileToDelete.id_file_pendukung],
          uploaded: prev[field].uploaded.filter((_, i) => i !== index),
        },
      }));
    } else {
      const newPreviews = [...fileState[field].previews];
      URL.revokeObjectURL(newPreviews[index].preview);
      newPreviews.splice(index, 1);

      const newFiles = [...fileState[field].files];
      newFiles.splice(index, 1);

      setFileState((prev) => ({
        ...prev,
        [field]: {
          ...prev[field],
          files: newFiles,
          previews: newPreviews,
        },
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    if (!formData.catatan) {
      newErrors.catatan = "Catatan wajib diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");

      // 1. First delete marked files
      const deletePromises = [];
      const fileTypes = ["file_360", "file_gambar", "file_pdf"];

      for (const field of fileTypes) {
        fileState[field].toDelete.forEach((fileId) => {
          deletePromises.push(
            axios.delete(
              `http://127.0.0.1:8000/api/fasilitas/files/${fileId}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
          );
        });
      }

      await Promise.all(deletePromises);

      // 2. Update pemetaan fasilitas
      await axios.put(
        `http://127.0.0.1:8000/api/pemetaan/fasilitas/${formData.id_pemetaan_fasilitas}`,
        {
          jenis_fasilitas: formData.jenis_fasilitas,
          nama_fasilitas: formData.nama_fasilitas,
          kategori_fasilitas: formData.kategori_fasilitas,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 3. Update fasilitas
      await axios.put(
        `http://127.0.0.1:8000/api/fasilitas/${id}`,
        {
          catatan: formData.catatan,
          id_tanah: formData.id_tanah,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4. Handle new file uploads
      const uploadPromises = [];

      // Reset upload progress
      setUploadProgress({
        file_360: 0,
        file_gambar: 0,
        file_pdf: 0,
      });

      for (const field of fileTypes) {
        if (fileState[field].files.length > 0) {
          const uploadData = new FormData();
          fileState[field].files.forEach((file) => {
            uploadData.append("files[]", file);
          });

          // Match the jenis_file values your backend expects
          let jenisFileValue;
          if (field === "file_360") jenisFileValue = "360";
          else if (field === "file_gambar") jenisFileValue = "gambar";
          else if (field === "file_pdf") jenisFileValue = "dokumen";

          uploadData.append("jenis_file", jenisFileValue);
          uploadData.append("keterangan", "Uploaded from frontend");

          uploadPromises.push(
            axios
              .post(
                `http://127.0.0.1:8000/api/fasilitas/${id}/files`,
                uploadData,
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                  },
                  onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                      (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress((prev) => ({
                      ...prev,
                      [field]: percentCompleted,
                    }));
                  },
                }
              )
              .then((response) => {
                setFileState((prev) => ({
                  ...prev,
                  [field]: {
                    ...prev[field],
                    files: [],
                    previews: [],
                    uploaded: [...prev[field].uploaded, ...response.data.data],
                  },
                }));
                return { field, success: true };
              })
              .catch((error) => {
                console.error(`Error uploading ${field}:`, error);
                return { field, success: false, error };
              })
          );
        }
      }

      // Wait for uploads and show success message
      const results = await Promise.all(uploadPromises);
      const failedUploads = results.filter((r) => !r.success);

      if (failedUploads.length > 0) {
        throw new Error(`Failed to upload ${failedUploads.length} files`);
      }

      Swal.fire({
        title: "Success",
        text: "Data fasilitas berhasil diperbarui",
        icon: "success",
      }).then(() => {
        navigate(`/tanah/peta/${formData.id_tanah}`);
      });
    } catch (error) {
      console.error("Submission error:", error);
      let errorMessage = "Terjadi kesalahan saat menyimpan data";

      if (error.response) {
        if (error.response.status === 422) {
          errorMessage = "Validasi gagal: ";
          const errors = error.response.data.errors;
          errorMessage += Object.values(errors).flat().join(", ");
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      Swal.fire("Error", errorMessage, "error");
    } finally {
      setIsSubmitting(false);
      setUploadProgress({
        file_360: 0,
        file_gambar: 0,
        file_pdf: 0,
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar>
        <div className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Edit Fasilitas
              </h1>

              {/* Tab Navigation */}
              <div className="flex border-b mb-6">
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "info"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("info")}
                >
                  Informasi Fasilitas
                </button>
                <button
                  className={`px-4 py-2 font-medium ${
                    activeTab === "files"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-500"
                  }`}
                  onClick={() => setActiveTab("files")}
                >
                  File Pendukung
                </button>
              </div>

              {/* Info Tab */}
              {activeTab === "info" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis Fasilitas
                      </label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.jenis_fasilitas}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            jenis_fasilitas: e.target.value,
                          })
                        }
                      >
                        <option value="Bergerak">Bergerak</option>
                        <option value="Tidak Bergerak">Tidak Bergerak</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Fasilitas
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.nama_fasilitas}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nama_fasilitas: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori Fasilitas
                      </label>
                      <select
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData.kategori_fasilitas}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            kategori_fasilitas: e.target.value,
                          })
                        }
                      >
                        <option value="">Pilih Kategori</option>
                        <option value="MASJID">Masjid</option>
                        <option value="SEKOLAH">Sekolah</option>
                        <option value="PEMAKAMAN">Pemakaman</option>
                        <option value="RUMAH">Rumah</option>
                        <option value="KANTOR">Kantor</option>
                        <option value="GEDUNG">Gedung</option>
                        <option value="LAINNYA">Lainnya</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lokasi Tanah
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-md bg-gray-50"
                        value={formData.lokasi}
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      className={`w-full px-3 py-2 border rounded-md ${
                        errors.catatan ? "border-red-500" : "border-gray-300"
                      }`}
                      rows="4"
                      value={formData.catatan}
                      onChange={(e) =>
                        setFormData({ ...formData, catatan: e.target.value })
                      }
                      placeholder="Tambahkan catatan tentang fasilitas ini"
                    />
                    {errors.catatan && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.catatan}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Files Tab */}
              {activeTab === "files" && (
                <div className="space-y-8">
                  {Object.entries(FILE_CONFIG).map(([field, config]) => (
                    <div key={field} className="border rounded-lg p-4">
                      <h3 className="text-lg font-medium mb-4">
                        {config.label}
                      </h3>

                      {/* File Upload Area */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Unggah File Baru ({config.extensions}, maks. 15MB)
                        </label>
                        <div className="flex items-center">
                          <label className="flex flex-col items-center px-4 py-6 bg-white rounded-lg border border-dashed border-gray-300 cursor-pointer hover:bg-gray-50">
                            <FaUpload className="text-gray-500 text-2xl mb-2" />
                            <span className="text-sm text-gray-600">
                              Pilih file
                            </span>
                            <input
                              type="file"
                              multiple
                              className="hidden"
                              accept={config.accept}
                              onChange={(e) => handleFileChange(field, e)}
                            />
                          </label>
                          {fileState[field].previews.length > 0 && (
                            <span className="ml-4 text-sm text-gray-500">
                              {fileState[field].previews.length} file siap
                              diupload
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Upload Progress */}
                      {uploadProgress[field] > 0 &&
                        uploadProgress[field] < 100 && (
                          <div className="mb-4">
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Upload progress:</span>
                              <span>{uploadProgress[field]}%</span>
                            </div>
                            <progress
                              value={uploadProgress[field]}
                              max="100"
                              className="w-full h-2 rounded"
                            />
                          </div>
                        )}

                      {/* New Files Preview */}
                      {fileState[field].previews.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            File Baru
                          </h4>
                          <div className="space-y-2">
                            {fileState[field].previews.map((preview, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
                              >
                                <div className="flex items-center">
                                  <a
                                    href={preview.preview}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center"
                                  >
                                    <FaEye className="mr-2" />
                                    {preview.name} (
                                    {Math.round(preview.size / 1024)} KB)
                                  </a>
                                </div>
                                <button
                                  onClick={() => handleRemoveFile(field, index)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Hapus file"
                                >
                                  <FaTimes />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Uploaded Files */}
                      {fileState[field].uploaded.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            File Tersimpan
                          </h4>
                          <div className="space-y-2">
                            {fileState[field].uploaded.map((file, index) => (
                              <div
                                key={file.id_file_pendukung}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
                              >
                                <div className="flex items-center">
                                  <a
                                    href={`${MINIO_BASE_URL}/${file.path_file}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center"
                                  >
                                    <FaEye className="mr-2" />
                                    {file.nama_asli} (
                                    {Math.round(file.ukuran_file / 1024)} KB)
                                  </a>
                                </div>
                                <button
                                  onClick={() =>
                                    handleRemoveFile(field, index, true)
                                  }
                                  className="text-red-600 hover:text-red-800"
                                  title="Hapus file"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 mt-8 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() =>
                    activeTab === "info"
                      ? setActiveTab("files")
                      : setActiveTab("info")
                  }
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  {activeTab === "info" ? "Lanjut ke File" : "Kembali ke Info"}
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default EditFasilitas;
