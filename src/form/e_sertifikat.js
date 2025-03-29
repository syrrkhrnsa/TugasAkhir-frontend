import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes, FaTrash } from "react-icons/fa";
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
          tanggal_pengajuan: sertifikat.tanggal_pengajuan || "",
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
    if (!file.type.includes("pdf")) {
      Swal.fire({
        icon: "error",
        title: "Format tidak valid",
        text: "Hanya file PDF yang diperbolehkan",
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

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Anda harus login terlebih dahulu",
      });
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
      return;
    }

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value) formDataToSend.append(key, value);
    });

    if (files.dokumen) {
      formDataToSend.append("dokumen", files.dokumen);
    }

    // For Pimpinan Jamaah, create approval request
    if (isPimpinanJamaah) {
      try {
        // Prepare FormData for file upload
        const formData = new FormData();
        formData.append("id_sertifikat", id);
        formData.append("jenis_sertifikat", formData.jenis_sertifikat);
        formData.append("status_pengajuan", formData.status_pengajuan);
        formData.append("tanggal_pengajuan", formData.tanggal_pengajuan);

        if (files.dokumen) {
          formData.append("dokumen", files.dokumen);
        } else if (originalData.dokumen) {
          // If no new file, send the existing file path
          formData.append("existing_dokumen", originalData.dokumen);
        }

        const response = await axios.post(
          `http://127.0.0.1:8000/api/approvals/${id}/update/approve`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Permintaan perubahan telah dikirim untuk persetujuan",
        }).then(() => {
          navigate(`/tanah/edit/${formData.id_tanah}`);
        });
        return;
      } catch (error) {
        console.error("Error creating approval:", error);
        let errorMessage = "Gagal mengirim permintaan persetujuan";

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 403) {
          errorMessage =
            "Anda tidak memiliki izin untuk melakukan tindakan ini";
        }

        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: errorMessage,
        });
        return;
      }
    }
  };

  const FilePreview = ({ field, label }) => (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-400">
        {label} <span className="text-red-500">*</span>
      </label>

      {filePreviews[field] && (
        <div className="mt-2 flex items-center gap-2">
          <a
            href={filePreviews[field]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <FaEye className="mr-1" /> Lihat Dokumen
          </a>
          <button
            type="button"
            onClick={() => handleRemoveFile(field)}
            className="flex items-center text-red-500 hover:text-red-700"
          >
            <FaTimes className="mr-1" /> Hapus
          </button>
        </div>
      )}

      <input
        id={field}
        type="file"
        accept=".pdf"
        className={`w-full border-b-2 p-2 focus:outline-none mt-2 ${
          !filePreviews[field] && !originalData?.dokumen
            ? "border-red-500"
            : "border-gray-300"
        }`}
        onChange={(e) => handleFileChange(field, e)}
        required={!originalData?.dokumen}
      />
      {!filePreviews[field] && !originalData?.dokumen && (
        <p className="text-red-500 text-xs mt-1">Dokumen wajib diupload</p>
      )}
    </div>
  );

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl">
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Edit</span>{" "}
              <span className="text-[#187556]">Sertifikat</span>
            </h2>

            {loading ? (
              <p className="text-center">Memuat data...</p>
            ) : (
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
                      setFormData({ ...formData, no_dokumen: e.target.value })
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
                      !formData.tanggal_pengajuan
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
                    required
                  />
                  {!formData.tanggal_pengajuan && (
                    <p className="text-red-500 text-xs mt-1">
                      Tanggal pengajuan wajib diisi
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
                      !formData.jenis_sertifikat
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
                    required
                  >
                    <option value="">Pilih Jenis Sertifikat</option>
                    <option value="BASTW">BASTW</option>
                    <option value="AIW">AIW</option>
                    <option value="SW">SW</option>
                  </select>
                  {!formData.jenis_sertifikat && (
                    <p className="text-red-500 text-xs mt-1">
                      Jenis sertifikat wajib dipilih
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
                      !formData.status_pengajuan
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

                {/* Dokumen Upload */}
                <div className="col-span-2">
                  <FilePreview
                    field="dokumen"
                    label="Dokumen Sertifikat (PDF)"
                  />
                </div>

                <div className="col-span-2 flex justify-center mt-8 gap-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/tanah/edit/${formData.id_tanah}`)}
                    className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB]"
                  >
                    {isPimpinanJamaah ? "Ajukan Perubahan" : "Simpan Perubahan"}
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
