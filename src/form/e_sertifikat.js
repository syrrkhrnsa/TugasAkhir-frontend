import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaTimes } from "react-icons/fa";

const EditSertifikat = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // State untuk data form
  const [formData, setFormData] = useState({
    noDokumenBastw: "",
    noDokumenAIW: "",
    noDokumenSW: "",
  });

  // State untuk file preview
  const [filePreviews, setFilePreviews] = useState({
    dokBastw: null,
    dokAiw: null,
    dokSw: null,
  });

  // State untuk file yang akan diupload
  const [files, setFiles] = useState({
    dokBastw: null,
    dokAiw: null,
    dokSw: null,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSertifikat();
  }, []);

  const fetchSertifikat = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk melihat data sertifikat.");
      navigate("/dashboard");
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/sertifikat/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const sertifikat = response.data.data || response.data;
      if (sertifikat) {
        setFormData({
          noDokumenBastw: sertifikat.noDokumenBastw || "",
          noDokumenAIW: sertifikat.noDokumenAIW || "",
          noDokumenSW: sertifikat.noDokumenSW || "",
        });

        // Set preview untuk file yang sudah ada
        setFilePreviews({
          dokBastw: sertifikat.dokBastw
            ? `http://127.0.0.1:8000/storage/${sertifikat.dokBastw}`
            : null,
          dokAiw: sertifikat.dokAiw
            ? `http://127.0.0.1:8000/storage/${sertifikat.dokAiw}`
            : null,
          dokSw: sertifikat.dokSw
            ? `http://127.0.0.1:8000/storage/${sertifikat.dokSw}`
            : null,
        });
      }
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      alert("Gagal mengambil data sertifikat.");
      navigate("/dashboard");
    }
  };

  // Handle file change untuk preview
  const handleFileChange = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Set file untuk upload
    setFiles((prev) => ({ ...prev, [field]: file }));

    // Buat preview URL
    const previewUrl = URL.createObjectURL(file);
    setFilePreviews((prev) => ({ ...prev, [field]: previewUrl }));
  };

  // Hapus file yang dipilih
  const handleRemoveFile = (field) => {
    setFiles((prev) => ({ ...prev, [field]: null }));
    setFilePreviews((prev) => ({ ...prev, [field]: null }));
    document.getElementById(field).value = ""; // Reset input file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("[DEBUG 1] Form submission started");
  
    // 1. Check token
    const token = localStorage.getItem("token");
    console.log("[DEBUG 2] Token from localStorage:", token ? "Exists" : "MISSING");
  
    // 2. Prepare FormData
    const formDataToSend = new FormData();
    console.log("[DEBUG 3] New FormData created");
  
    // 3. Log current form state before processing
    console.log("[DEBUG 4] Current formData state:", JSON.stringify(formData, null, 2));
    console.log("[DEBUG 5] Current files state:", files);
  
    // 4. Add text fields to FormData
    console.log("[DEBUG 6] Adding text fields to FormData:");
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        formDataToSend.append(key, value);
        console.log(`  - Appended ${key}:`, value);
      } else {
        console.log(`  - Skipped ${key} (empty value)`);
      }
    });
  
    // 5. Add files to FormData
    console.log("[DEBUG 7] Adding files to FormData:");
    Object.entries(files).forEach(([key, file]) => {
      if (file) {
        formDataToSend.append(key, file);
        console.log(`  - Appended file ${key}:`, file.name, file);
      } else {
        console.log(`  - Skipped file ${key} (no file)`);
      }
    });
  
    // 6. Add method override
    formDataToSend.append('_method', 'PUT');
    console.log("[DEBUG 8] Added _method=PUT");
  
    // 7. Verify final FormData contents
    console.log("[DEBUG 9] Final FormData contents:");
    for (let [key, value] of formDataToSend.entries()) {
      if (value instanceof File) {
        console.log(`  - ${key}:`, `File(${value.name}, ${value.size} bytes)`);
      } else {
        console.log(`  - ${key}:`, value);
      }
    }
  
    try {
      console.log("[DEBUG 10] Sending request to backend...");
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/sertifikat/${id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );
      
      console.log("[DEBUG 11] Request successful! Response:", response.data);
      alert("Data berhasil diperbarui!");
      navigate("/dashboard");
    } catch (error) {
      console.error("[DEBUG 12] Request failed:", {
        errorMessage: error.message,
        responseData: error.response?.data,
        requestConfig: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          data: error.config?.data
        },
        fullError: error
      });
      
      alert(`Gagal memperbarui data. Error: ${error.response?.data?.message || error.message}`);
    }
  };

  // Komponen untuk menampilkan preview dokumen
  const FilePreview = ({ field, label }) => (
    <div className="flex flex-col">
      <label className="block text-sm font-medium text-gray-400">{label}</label>

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
            className="text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      <input
        id={field}
        type="file"
        accept=".pdf"
        className="w-full border-b-2 border-gray-300 p-2 focus:outline-none mt-2"
        onChange={(e) => handleFileChange(field, e)}
      />
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
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="grid grid-cols-2 gap-8">
                  {/* Input untuk No Dokumen BASTW */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-400">
                      No Dokumen BASTW
                    </label>
                    <input
                      type="text"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                      value={formData.noDokumenBastw}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          noDokumenBastw: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Input untuk Dokumen BASTW */}
                  <FilePreview field="dokBastw" label="Dokumen BASTW" />

                  {/* Input untuk No Dokumen AIW */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-400">
                      No Dokumen AIW
                    </label>
                    <input
                      type="text"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                      value={formData.noDokumenAIW}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          noDokumenAIW: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Input untuk Dokumen AIW */}
                  <FilePreview field="dokAiw" label="Dokumen AIW" />

                  {/* Input untuk No Dokumen SW */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-400">
                      No Dokumen SW
                    </label>
                    <input
                      type="text"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none"
                      value={formData.noDokumenSW}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          noDokumenSW: e.target.value,
                        })
                      }
                    />
                  </div>

                  {/* Input untuk Dokumen SW */}
                  <FilePreview field="dokSw" label="Dokumen SW" />
                </div>

                <div className="flex justify-center mt-8">
                  <button
                    type="submit"
                    className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB]"
                  >
                    Simpan Perubahan
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
