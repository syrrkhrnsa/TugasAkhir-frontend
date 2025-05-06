import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import Swal from "sweetalert2";

const CreateInventaris = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // id_fasilitas from route
  
  const [formData, setFormData] = useState({
    id_fasilitas: id || "",
    nama_barang: "",
    kode_barang: "",
    satuan: "",
    jumlah: 1,
    kondisi: "baik",
    detail: "",
    waktu_perolehan: "",
    catatan: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // You could fetch facility data here if needed
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

    if (!formData.nama_barang) {
      newErrors.nama_barang = "Nama barang wajib diisi";
      isValid = false;
    }
    if (!formData.satuan) {
      newErrors.satuan = "Satuan wajib diisi";
      isValid = false;
    }
    if (!formData.jumlah || formData.jumlah < 1) {
      newErrors.jumlah = "Jumlah minimal 1";
      isValid = false;
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
      const response = await axios.post(
        "http://127.0.0.1:8000/api/inventaris",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      Swal.fire({
        title: "Berhasil!",
        text: "Data inventaris berhasil ditambahkan",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate(`/inventaris/fasilitas/${id}`);
      });
    } catch (error) {
      console.error("Error:", error.response?.data);
      let errorMessage = "Terjadi kesalahan saat menyimpan data";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        errorMessage = Object.values(error.response.data.errors).join("\n");
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
              <span className="text-[#FECC23]">Tambah</span>{" "}
              <span className="text-[#187556]">Inventaris</span>
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-3 gap-8">
              {/* Nama Barang */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Nama Barang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nama_barang"
                  value={formData.nama_barang}
                  onChange={handleChange}
                  className={`w-full border-b-2 p-2 ${errors.nama_barang ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.nama_barang && (
                  <p className="text-red-500 text-xs mt-1">{errors.nama_barang}</p>
                )}
              </div>

              {/* Kode Barang */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Kode Barang
                </label>
                <input
                  type="text"
                  name="kode_barang"
                  value={formData.kode_barang}
                  onChange={handleChange}
                  className="w-full border-b-2 p-2 border-gray-300"
                />
              </div>

              {/* Satuan */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Satuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="satuan"
                  value={formData.satuan}
                  onChange={handleChange}
                  className={`w-full border-b-2 p-2 ${errors.satuan ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.satuan && (
                  <p className="text-red-500 text-xs mt-1">{errors.satuan}</p>
                )}
              </div>

              {/* Jumlah */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Jumlah <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="jumlah"
                  min="1"
                  value={formData.jumlah}
                  onChange={handleChange}
                  className={`w-full border-b-2 p-2 ${errors.jumlah ? "border-red-500" : "border-gray-300"}`}
                />
                {errors.jumlah && (
                  <p className="text-red-500 text-xs mt-1">{errors.jumlah}</p>
                )}
              </div>

              {/* Kondisi */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Kondisi <span className="text-red-500">*</span>
                </label>
                <select
                  name="kondisi"
                  value={formData.kondisi}
                  onChange={handleChange}
                  className="w-full border-b-2 p-2 border-gray-300"
                >
                  <option value="baik">Baik</option>
                  <option value="rusak_ringan">Rusak Ringan</option>
                  <option value="rusak_berat">Rusak Berat</option>
                  <option value="hilang">Hilang</option>
                </select>
              </div>

              {/* Waktu Perolehan */}
              <div className="flex flex-col">
                <label className="text-sm font-medium text-gray-400">
                  Waktu Perolehan
                </label>
                <input
                  type="date"
                  name="waktu_perolehan"
                  value={formData.waktu_perolehan}
                  onChange={handleChange}
                  className="w-full border-b-2 p-2 border-gray-300"
                />
              </div>

              {/* Detail */}
              <div className="flex flex-col col-span-3">
                <label className="text-sm font-medium text-gray-400">
                  Detail
                </label>
                <input
                  type="text"
                  name="detail"
                  value={formData.detail}
                  onChange={handleChange}
                  className="w-full border-b-2 p-2 border-gray-300"
                />
              </div>

              {/* Catatan */}
              <div className="flex flex-col col-span-3">
                <label className="text-sm font-medium text-gray-400">
                  Catatan
                </label>
                <textarea
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  rows="3"
                  className="w-full border-b-2 border-gray-300 p-2"
                ></textarea>
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
                  disabled={isSubmitting}
                  className={`bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB] transition-colors ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
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

export default CreateInventaris;