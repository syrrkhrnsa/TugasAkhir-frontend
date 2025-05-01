import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const CreateFasilitas = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Get state passed from navigation
  const { pemetaanFasilitasData, tanahData } = location.state || {};

  const [formData, setFormData] = useState({
    id_pemetaan_fasilitas: id || "",
    id_tanah: tanahData?.id_tanah || "",
    jenis_fasilitas: "",
    nama_fasilitas: "",
    kategori_fasilitas: "",
    catatan: "",
    id_tanah: tanahId || "", // Tambahkan id_tanah dari props
  });

  const [files, setFiles] = useState({
    file_360: null,
    file_gambar: null,
    file_pdf: null,
  });

  const [filePreviews, setFilePreviews] = useState({
    file_360: null,
    file_gambar: null,
    file_pdf: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If data was passed via state, use that (preferred method)
    if (pemetaanFasilitasData) {
      setFormData({
        id_pemetaan_fasilitas: pemetaanFasilitasData.id_pemetaan_fasilitas,
        id_tanah: tanahData?.id_tanah || pemetaanFasilitasData.pemetaan_tanah?.id_tanah || "",
        jenis_fasilitas: pemetaanFasilitasData.jenis_fasilitas,
        nama_fasilitas: pemetaanFasilitasData.nama_fasilitas,
        kategori_fasilitas: pemetaanFasilitasData.kategori_fasilitas,
        catatan: "",
        lokasi: tanahData?.lokasi || pemetaanFasilitasData.pemetaan_tanah?.lokasi || "",
      });
      return;
    }

    // Fallback to API if no state data
    if (id) {
      fetchDataFromAPI();
    } else {
      Swal.fire("Error", "ID Pemetaan Fasilitas tidak ditemukan", "error");
      navigate("/fasilitas");
    }
  }, [id, pemetaanFasilitasData, tanahData, navigate]);

  const fetchDataFromAPI = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/pemetaan/fasilitas-detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data.data;
      setFormData({
        id_pemetaan_fasilitas: id,
        id_tanah: data.pemetaan_tanah?.id_tanah || "",
        jenis_fasilitas: data.jenis_fasilitas,
        nama_fasilitas: data.nama_fasilitas,
        kategori_fasilitas: data.kategori_fasilitas,
        catatan: "",
        lokasi: data.pemetaan_tanah?.lokasi || "",
      });
    } catch (error) {
      console.error("Error fetching pemetaan fasilitas:", error);
      Swal.fire("Error", "Gagal memuat data fasilitas", "error");
      navigate("/fasilitas");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxFileSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxFileSize) {
      Swal.fire("Error", "Ukuran file maksimal 5MB", "error");
      return;
    }

    if (field === "file_pdf" && !file.type.includes("pdf")) {
      Swal.fire("Error", "Unggahan dokumen harus file PDF", "error");
      return;
    }

    if (
      (field === "file_360" || field === "file_gambar") &&
      !file.type.startsWith("image/")
    ) {
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

    if (!formData.catatan) {
      newErrors.catatan = "Catatan wajib diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    console.log('Form data before submit:', formData);
    console.log('Files before submit:', files);
  
    if (!validateForm()) {
      console.log('Validation errors:', errors);
      Swal.fire("Error", "Harap isi semua field wajib", "error");
      return;
    }
  
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("id_pemetaan_fasilitas", formData.id_pemetaan_fasilitas);
      formDataToSend.append("id_tanah", formData.id_tanah);
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
  
      console.log('FormData being sent:', formDataToSend);
  
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
  
      console.log('Response from server:', response.data);
  
      Swal.fire({
        title: "Success!",
        text: "Fasilitas berhasil dibuat",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(`/tanah/peta/${formData.id_tanah}`);
      });
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
              <span className="text-[#FECC23]">Detail</span>{" "}
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
  <div className="flex flex-col">
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
      accept={field === "file_pdf" ? ".pdf" : "image/*"}
      className="w-full border-b-2 border-gray-300 p-2 mt-2"
      onChange={(e) => onChange(field, e)}
    />
  </div>
);

export default CreateFasilitas;