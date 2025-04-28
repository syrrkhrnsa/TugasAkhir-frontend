import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes } from "react-icons/fa";
import Swal from "sweetalert2";

const CreateFasilitas = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Ambil data fasilitas dari state router
  const { fasilitas: fasilitasData, tanahId } = location.state || {};

  const [formData, setFormData] = useState({
    // Data untuk pemetaan_fasilitas
    jenis_fasilitas: fasilitasData?.jenis_fasilitas || "Tidak Bergerak",
    nama_fasilitas: fasilitasData?.nama_fasilitas || "",
    kategori_fasilitas: fasilitasData?.kategori_fasilitas || "",

    // Data untuk tabel fasilitas
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

  // Jika dalam mode edit, ambil data tambahan dari endpoint fasilitas
  useEffect(() => {
    if (fasilitasData?.id_pemetaan_fasilitas) {
      const fetchFasilitasDetails = async () => {
        try {
          const token = localStorage.getItem("token");
          const response = await axios.get(
            `http://127.0.0.1:8000/api/fasilitas-detail/${fasilitasData.id_pemetaan_fasilitas}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          const fasilitasDetails = response.data.data;
          setFormData((prev) => ({
            ...prev,
            catatan: fasilitasDetails?.catatan || "",
          }));

          // Set preview untuk file yang sudah ada (jika ada)
          if (fasilitasDetails?.file_360) {
            setFilePreviews((prev) => ({
              ...prev,
              file_360: `http://127.0.0.1:8000/storage/${fasilitasDetails.file_360}`,
            }));
          }
          if (fasilitasDetails?.file_gambar) {
            setFilePreviews((prev) => ({
              ...prev,
              file_gambar: `http://127.0.0.1:8000/storage/${fasilitasDetails.file_gambar}`,
            }));
          }
          if (fasilitasDetails?.file_pdf) {
            setFilePreviews((prev) => ({
              ...prev,
              file_pdf: `http://127.0.0.1:8000/storage/${fasilitasDetails.file_pdf}`,
            }));
          }
        } catch (error) {
          console.error("Gagal mengambil detail fasilitas:", error);
        }
      };

      fetchFasilitasDetails();
    }
  }, [fasilitasData?.id_pemetaan_fasilitas]);

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

    if (!formData.jenis_fasilitas) {
      newErrors.jenis_fasilitas = "Jenis fasilitas wajib diisi";
      isValid = false;
    }
    if (!formData.nama_fasilitas) {
      newErrors.nama_fasilitas = "Nama fasilitas wajib diisi";
      isValid = false;
    }
    if (!formData.kategori_fasilitas) {
      newErrors.kategori_fasilitas = "Kategori fasilitas wajib diisi";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // Validasi tambahan untuk id_tanah
    if (!formData.id_tanah) {
      Swal.fire("Error", "ID Tanah wajib diisi", "error");
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      // 1. Simpan/Update data pemetaan fasilitas
      const pemetaanData = {
        jenis_fasilitas: formData.jenis_fasilitas,
        nama_fasilitas: formData.nama_fasilitas,
        kategori_fasilitas: formData.kategori_fasilitas,
      };

      let pemetaanResponse;

      if (fasilitasData?.id_pemetaan_fasilitas) {
        // Update pemetaan fasilitas
        pemetaanResponse = await axios.put(
          `http://127.0.0.1:8000/api/pemetaan/fasilitas/${fasilitasData.id_pemetaan_fasilitas}`,
          pemetaanData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Buat pemetaan fasilitas baru
        if (!tanahId) {
          Swal.fire("Error", "ID Tanah tidak ditemukan", "error");
          return;
        }

        pemetaanResponse = await axios.post(
          `http://127.0.0.1:8000/api/pemetaan/fasilitas/${tanahId}`,
          pemetaanData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      const pemetaanId = pemetaanResponse.data.data.id_pemetaan_fasilitas;

      // 2. Simpan/Update data fasilitas (file dan catatan)
      const fasilitasFormData = new FormData();
      fasilitasFormData.append("id_pemetaan_fasilitas", pemetaanId);
      fasilitasFormData.append("id_tanah", formData.id_tanah); // Gunakan id_tanah dari state
      fasilitasFormData.append("catatan", formData.catatan);

      if (files.file_360) {
        fasilitasFormData.append("file_360", files.file_360);
      }
      if (files.file_gambar) {
        fasilitasFormData.append("file_gambar", files.file_gambar);
      }
      if (files.file_pdf) {
        fasilitasFormData.append("file_pdf", files.file_pdf);
      }

      if (fasilitasData?.id_fasilitas) {
        // Update fasilitas
        await axios.put(
          `http://127.0.0.1:8000/api/fasilitas/${fasilitasData.id_fasilitas}`,
          fasilitasFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // Buat fasilitas baru
        await axios.post(
          "http://127.0.0.1:8000/api/fasilitas",
          fasilitasFormData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      Swal.fire(
        "Success!",
        `Fasilitas berhasil ${
          fasilitasData?.id_pemetaan_fasilitas ? "diperbarui" : "dibuat"
        }`,
        "success"
      ).then(() => {
        navigate(-1); // Kembali 1 langkah dalam histori
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

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl">
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">
                {fasilitasData?.id_pemetaan_fasilitas ? "Edit" : "Tambah"}
              </span>{" "}
              <span className="text-[#187556]">Fasilitas</span>
            </h2>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid grid-cols-3 gap-8"
            >
              {/* Jenis Fasilitas */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Jenis Fasilitas <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full border-b-2 p-2 focus:outline-none ${
                    errors.jenis_fasilitas
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={formData.jenis_fasilitas}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      jenis_fasilitas: e.target.value,
                    })
                  }
                >
                  <option value="Tidak Bergerak">Tidak Bergerak</option>
                  <option value="Bergerak">Bergerak</option>
                </select>
                {errors.jenis_fasilitas && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.jenis_fasilitas}
                  </p>
                )}
              </div>

              {/* Nama Fasilitas */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Nama Fasilitas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className={`w-full border-b-2 p-2 focus:outline-none ${
                    errors.nama_fasilitas ? "border-red-500" : "border-gray-300"
                  }`}
                  value={formData.nama_fasilitas}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_fasilitas: e.target.value })
                  }
                />
                {errors.nama_fasilitas && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.nama_fasilitas}
                  </p>
                )}
              </div>

              {/* Kategori Fasilitas */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Kategori Fasilitas <span className="text-red-500">*</span>
                </label>
                <select
                  className={`w-full border-b-2 p-2 focus:outline-none ${
                    errors.kategori_fasilitas
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
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
                {errors.kategori_fasilitas && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.kategori_fasilitas}
                  </p>
                )}
              </div>

              {/* Catatan */}
              <div className="flex flex-col col-span-3">
                <label className="text-sm font-medium text-gray-400">
                  Catatan
                </label>
                <textarea
                  className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                  value={formData.catatan}
                  onChange={(e) =>
                    setFormData({ ...formData, catatan: e.target.value })
                  }
                  rows="3"
                ></textarea>
              </div>

              {/* Upload Files */}
              <div className="col-span-3">
                <div className="flex gap-8">
                  <div className="flex-1">
                    <UploadFile
                      field="file_360"
                      label="Unggah View 360 (gambar)"
                      preview={filePreviews.file_360}
                      onChange={handleFileChange}
                      onRemove={handleRemoveFile}
                    />
                  </div>
                  <div className="flex-1">
                    <UploadFile
                      field="file_gambar"
                      label="Unggah Gambar Fasilitas"
                      preview={filePreviews.file_gambar}
                      onChange={handleFileChange}
                      onRemove={handleRemoveFile}
                    />
                  </div>
                  <div className="flex-1">
                    <UploadFile
                      field="file_pdf"
                      label="Unggah PDF"
                      preview={filePreviews.file_pdf}
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
