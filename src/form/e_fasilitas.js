import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const EditFasilitas = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
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

  const [files, setFiles] = useState({
    view360: null,
    gambarFasilitas: null,
    dokumenPdf: null,
  });

  const [existingFiles, setExistingFiles] = useState({
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/fasilitas/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Check if response data exists
        if (!response.data || !response.data.data) {
          throw new Error("Invalid API response format");
        }

        const data = response.data.data;
        
        // Set form data with proper fallbacks
        setFormData({
          id_fasilitas: data.id_fasilitas || id,
          id_pemetaan_fasilitas: data.id_pemetaan_fasilitas || "",
          id_tanah: data.id_tanah || "",
          jenis_fasilitas: data.jenis_fasilitas || 
                         (data.pemetaan_fasilitas?.jenis_fasilitas || "Tidak Bergerak"),
          nama_fasilitas: data.nama_fasilitas || 
                         (data.pemetaan_fasilitas?.nama_fasilitas || ""),
          kategori_fasilitas: data.kategori_fasilitas || 
                            (data.pemetaan_fasilitas?.kategori_fasilitas || ""),
          catatan: data.catatan || "",
          lokasi: data.lokasi || 
                (data.tanah?.lokasi || 
                 data.pemetaan_fasilitas?.pemetaan_tanah?.lokasi || ""),
        });

        // Set existing files with null checks
        const newExistingFiles = {
          view360: data.file_360 ? 
                  `http://127.0.0.1:8000/storage/${data.file_360}` : null,
          gambarFasilitas: data.file_gambar ? 
                         `http://127.0.0.1:8000/storage/${data.file_gambar}` : null,
          dokumenPdf: data.file_pdf ? 
                    `http://127.0.0.1:8000/storage/${data.file_pdf}` : null,
        };

        setExistingFiles(newExistingFiles);
        setFilePreviews(newExistingFiles);

      } catch (error) {
        console.error("Error fetching fasilitas:", error);
        
        // Try to use location state if API fails
        if (location.state?.detailData) {
          const { detailData, pemetaanFasilitasData, tanahData } = location.state;
          
          setFormData({
            id_fasilitas: detailData.id_fasilitas || id,
            id_pemetaan_fasilitas: pemetaanFasilitasData?.id_pemetaan_fasilitas || "",
            id_tanah: tanahData?.id_tanah || "",
            jenis_fasilitas: pemetaanFasilitasData?.jenis_fasilitas || "Tidak Bergerak",
            nama_fasilitas: pemetaanFasilitasData?.nama_fasilitas || "",
            kategori_fasilitas: pemetaanFasilitasData?.kategori_fasilitas || "",
            catatan: detailData.catatan || "",
            lokasi: tanahData?.lokasi || "",
          });
          
          const filesFromState = {
            view360: detailData.file_360 ? 
                   `http://127.0.0.1:8000/storage/${detailData.file_360}` : null,
            gambarFasilitas: detailData.file_gambar ? 
                           `http://127.0.0.1:8000/storage/${detailData.file_gambar}` : null,
            dokumenPdf: detailData.file_pdf ? 
                      `http://127.0.0.1:8000/storage/${detailData.file_pdf}` : null,
          };
          
          setExistingFiles(filesFromState);
          setFilePreviews(filesFromState);
        } else {
          Swal.fire({
            title: "Error",
            text: error.response?.data?.message || 
                 "Gagal memuat data fasilitas",
            icon: "error"
          }).then(() => {
            navigate(-1); // Go back if data can't be loaded
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, location.state]);

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

  const handleRemoveExistingFile = async (field) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://127.0.0.1:8000/api/fasilitas/${id}/remove-file`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            file_type: field === "view360" ? "file_360" : 
                     field === "gambarFasilitas" ? "file_gambar" : "file_pdf"
          }
        }
      );

      setExistingFiles({ ...existingFiles, [field]: null });
      setFilePreviews({ ...filePreviews, [field]: null });
      
      Swal.fire("Success", "File berhasil dihapus", "success");
    } catch (error) {
      console.error("Error removing file:", error);
      Swal.fire("Error", "Gagal menghapus file", "error");
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.catatan) {
      newErrors.catatan = "Catatan wajib diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      Swal.fire("Error", "Harap isi semua field wajib", "error");
      return;
    }
  
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("_method", "PUT");
      formDataToSend.append("catatan", formData.catatan);
  
      if (files.view360) {
        formDataToSend.append("file_360", files.view360);
      }
      if (files.gambarFasilitas) {
        formDataToSend.append("file_gambar", files.gambarFasilitas);
      }
      if (files.dokumenPdf) {
        formDataToSend.append("file_pdf", files.dokumenPdf);
      }
  
      const response = await axios.post(
        `http://127.0.0.1:8000/api/fasilitas/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      Swal.fire({
        title: "Success!",
        text: "Fasilitas berhasil diperbarui",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(`/tanah/peta/${formData.id_tanah}`);
      });
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

  if (isLoading) {
    return (
      <div className="relative">
        <Sidebar>
          <div className="flex-1 p-4">
            <div className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl">
              <h2 className="text-center text-3xl font-bold">
                <span className="text-[#FECC23]">Memuat</span>{" "}
                <span className="text-[#187556]">Data...</span>
              </h2>
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
          <div className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl">
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Edit</span>{" "}
              <span className="text-[#187556]">Fasilitas</span>
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-3 gap-8">
              {/* Form Fields */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Jenis Fasilitas
                </label>
                <input
                  type="text"
                  className="w-full border-b-2 p-2 border-gray-300 bg-gray-100"
                  value={formData.jenis_fasilitas}
                  readOnly
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Nama Fasilitas
                </label>
                <input
                  type="text"
                  className="w-full border-b-2 p-2 border-gray-300 bg-gray-100"
                  value={formData.nama_fasilitas}
                  readOnly
                />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Kategori Fasilitas
                </label>
                <input
                  type="text"
                  className="w-full border-b-2 p-2 border-gray-300 bg-gray-100"
                  value={formData.kategori_fasilitas}
                  readOnly
                />
              </div>

              <input type="hidden" name="id_tanah" value={formData.id_tanah} />
              <input type="hidden" name="id_pemetaan_fasilitas" value={formData.id_pemetaan_fasilitas} />

              <div className="flex flex-col col-span-3">
                <label className="text-sm font-medium text-gray-400">
                  Catatan <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`w-full border-b-2 border-gray-300 p-2 focus:outline-none ${
                    errors.catatan ? "border-red-500" : ""
                  }`}
                  value={formData.catatan}
                  onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                  rows="3"
                  required
                ></textarea>
                {errors.catatan && (
                  <p className="text-red-500 text-xs mt-1">{errors.catatan}</p>
                )}
              </div>

              {/* File Uploads */}
              <div className="col-span-3">
                <div className="flex gap-8">
                  <div className="flex-1">
                    <UploadFile
                      field="view360"
                      label="View 360 (gambar)"
                      preview={filePreviews.view360}
                      existingFile={existingFiles.view360}
                      onChange={handleFileChange}
                      onRemove={handleRemoveFile}
                      onRemoveExisting={handleRemoveExistingFile}
                    />
                  </div>
                  <div className="flex-1">
                    <UploadFile
                      field="gambarFasilitas"
                      label="Gambar Fasilitas"
                      preview={filePreviews.gambarFasilitas}
                      existingFile={existingFiles.gambarFasilitas}
                      onChange={handleFileChange}
                      onRemove={handleRemoveFile}
                      onRemoveExisting={handleRemoveExistingFile}
                    />
                  </div>
                  <div className="flex-1">
                    <UploadFile
                      field="dokumenPdf"
                      label="Dokumen PDF"
                      preview={filePreviews.dokumenPdf}
                      existingFile={existingFiles.dokumenPdf}
                      onChange={handleFileChange}
                      onRemove={handleRemoveFile}
                      onRemoveExisting={handleRemoveExistingFile}
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
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
                  disabled={isSubmitting || !formData.catatan}
                  className={`bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB] transition-colors ${
                    isSubmitting || !formData.catatan ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

const UploadFile = ({ field, label, preview, existingFile, onChange, onRemove, onRemoveExisting }) => (
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
          <FaEye className="mr-1" /> Lihat {existingFile ? "File" : "Preview"}
        </a>
        
        {existingFile ? (
          <button
            type="button"
            onClick={() => onRemoveExisting(field)}
            className="text-red-500 hover:text-red-700 flex items-center"
          >
            <FaTimes className="mr-1" /> Hapus File
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onRemove(field)}
            className="text-red-500 hover:text-red-700 flex items-center"
          >
            <FaTimes className="mr-1" /> Hapus
          </button>
        )}
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
    
    {existingFile && !preview && (
      <p className="text-green-500 text-sm mt-1">File akan dihapus saat disimpan</p>
    )}
  </div>
);

export default EditFasilitas;