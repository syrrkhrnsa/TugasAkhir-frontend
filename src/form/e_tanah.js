import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaPlus, FaEdit } from "react-icons/fa";
import { getUserId, getRoleId } from "../utils/Auth";

const EditTanah = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();

  const [NamaPimpinanJamaah, setNamaPimpinanJamaah] = useState("");
  const [NamaWakif, setNamaWakif] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [luasTanah, setLuasTanah] = useState("");
  const [loading, setLoading] = useState(true);
  const [sertifikatList, setSertifikatList] = useState([]);
  const [roleUser, setRoleUser] = useState("");
  const sertifikatId = sertifikatList[0]?.id_sertifikat;

  const roleId = getRoleId();
  const isPimpinanJamaah = roleId === "326f0dde-2851-4e47-ac5a-de6923447317";
  const [users, setUsers] = useState([]);
  const [provinsi, setProvinsi] = useState("");
  const [kota, setKota] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);
  const [detailLokasi, setDetailLokasi] = useState("");
  const lokasiLengkap = `${provinsiList.find((p) => p.id === provinsi)?.name}, ${kotaList.find((k) => k.id === kota)?.name}, ${kecamatanList.find((k) => k.id === kecamatan)?.name}, ${kelurahanList.find((k) => k.id === kelurahan)?.name}, ${detailLokasi}`;


  useEffect(() => {
    fetchTanah();
    fetchSertifikat();
    fetchUserRole();
  }, []);

   // Ambil data pengguna
   useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Anda harus login untuk melihat data pengguna.");
        return;
      }
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/data/user", {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, 
  []);

  // Ambil data provinsi saat komponen dimuat
  useEffect(() => {
    const fetchProvinsi = async () => {
      try {
        const response = await axios.get("https://api.binderbyte.com/wilayah/provinsi?api_key=231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d");
        setProvinsiList(response.data.value);
      } catch (error) {
        console.error("Error fetching provinsi:", error);
      }
    };

    fetchProvinsi();
  }, []);

  // Ambil data kabupaten saat provinsi dipilih
  useEffect(() => {
    if (provinsi) {
      const fetchKota = async () => {
        try {
          const response = await axios.get(`https://api.binderbyte.com/wilayah/kabupaten?api_key=231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d&id_provinsi=${provinsi}`);
          setKotaList(response.data.value);
        } catch (error) {
          console.error("Error fetching kota:", error);
        }
      };

      fetchKota();
    }
  }, [provinsi]);

  // Fetch Kecamatan
  useEffect(() => {
    if (kota) {
      const fetchKecamatan = async () => {
        try {
          const response = await axios.get(`https://api.binderbyte.com/wilayah/kecamatan?api_key=231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d&id_kabupaten=${kota}`);
          setKecamatanList(response.data.value || []);
        } catch (error) {
          console.error("Error fetching kecamatan:", error);
        }
      };
      fetchKecamatan();
    }
  }, [kota]);

  // Fetch Kelurahan
  useEffect(() => {
    if (kecamatan) {
      const fetchKelurahan = async () => {
        try {
          const response = await axios.get(`https://api.binderbyte.com/wilayah/kelurahan?api_key=231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d&id_kecamatan=${kecamatan}`);
          setKelurahanList(response.data.value || []);
        } catch (error) {
          console.error("Error fetching kelurahan:", error);
        }
      };
      fetchKelurahan();
    }
  }, [kecamatan]);


  const fetchTanah = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk mengedit data.");
      navigate("/dashboard");
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/tanah/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      console.log("Response dari API:", response.data); // Cek response di console

      // Periksa struktur response, bisa jadi datanya ada di response.data.data
      const tanah = response.data.data || response.data;

      if (tanah) {
        setNamaPimpinanJamaah(tanah.NamaPimpinanJamaah || "");
        setNamaWakif(tanah.NamaWakif || "");
        setLokasi(tanah.lokasi || "");
        setLuasTanah(tanah.luasTanah || "");
      }
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data tanah:", error);
      alert("Gagal mengambil data tanah.");
      navigate("/dashboard");
    }
  };

  const fetchSertifikat = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk melihat data sertifikat.");
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/sertifikat/tanah/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      setSertifikatList(response.data.data || response.data);
    } catch (error) {
      console.error("Gagal mengambil data sertifikat:", error);
      alert("Gagal mengambil data sertifikat.");
    }
  };

  const fetchUserRole = () => {
    const role = localStorage.getItem("role"); // Asumsikan role disimpan di localStorage
    setRoleUser(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk mengedit data.");
      return;
    }

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/tanah/${id}`,
        { NamaPimpinanJamaah, NamaWakif, lokasi, luasTanah },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      // Perbarui state tanahList di localStorage
      const storedTanahList =
        JSON.parse(localStorage.getItem("tanahList")) || [];
      const updatedTanahList = storedTanahList.map((tanah) =>
        tanah.id_tanah === id
          ? {
              ...tanah,
              "NamaPimpinanJamaah" : NamaPimpinanJamaah,
              "NamaWakif" : NamaWakif,
              "lokasi" : lokasiLengkap,
              "luasTanah" : luasTanah,
            }
          : tanah
      );

      localStorage.setItem("tanahList", JSON.stringify(updatedTanahList));

      alert("Data berhasil diperbarui!");
      navigate("/dashboard"); // Kembali ke dashboard tanpa reload API
    } catch (error) {
      console.error("Gagal memperbarui data:", error);
      alert("Terjadi kesalahan saat memperbarui data.");
    }
  };

  const calculateDayDifference = (dateString) => {
    const today = new Date(); // Tanggal hari ini
    const targetDate = new Date(dateString); // Tanggal dari data sertifikat
    const timeDifference = today - targetDate; // Selisih waktu dalam milidetik
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24)); // Konversi ke hari
    return `${dayDifference} hari`; // Format hasil
  };

  const handlePreviewDokumen = (dokumen) => {
    // Implementasi preview dokumen
    console.log("Preview dokumen:", dokumen);
    // Bisa menggunakan library seperti react-pdf atau modal untuk menampilkan dokumen
  };

  const handleCreateLegalitas = () => {
    console.log("Tombol Create diklik");
    // Implementasi logika untuk membuat legalitas baru
  };

  const handleUpdateLegalitas = (sertifikatId) => {
    if (sertifikatId) {
      navigate(`/sertifikat/edit/${sertifikatId}`);
    } else {
      alert("Tidak ada sertifikat yang dapat diupdate.");
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[90%] max-w-3xl"
            style={{
              boxShadow:
                "0px 5px 15px rgba(0, 0, 0, 0.1), 0px -5px 15px rgba(0, 0, 0, 0.1), 5px 0px 15px rgba(0, 0, 0, 0.1), -5px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            {/* Judul */}
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Edit</span>{" "}
              <span className="text-[#187556]">Tanah</span>
            </h2>
            <p className="text-center text-gray-500">PC Persis Banjaran</p>

            {loading ? (
              <p className="text-center text-gray-500 mt-6">Memuat data...</p>
            ) : (
              <>
                {/* Form Edit Tanah */}
                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="grid grid-cols-2 gap-8 justify-center">
                    {/* Kolom kiri */}
                    <div className="flex flex-col items-left">
                      <label className="block text-sm font-medium text-gray-400">
                        Pimpinan Jamaah
                      </label>
                      <input
                        type="text"
                        className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                        value={NamaPimpinanJamaah}
                        onChange={(e) => setNamaPimpinanJamaah(e.target.value)}
                        required
                      />

                      <label className="block text-sm font-medium text-gray-400 mt-6">
                        Lokasi
                      </label>
                      <input
                        type="text"
                        className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                        value={lokasi}
                        onChange={(e) => setLokasi(e.target.value)}
                        required
                      />
                    </div>

                    {/* Kolom kanan */}
                    <div className="flex flex-col items-left">
                      <label className="block text-sm font-medium text-gray-400">
                        Nama Wakif
                      </label>
                      <input
                        type="text"
                        className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                        value={NamaWakif}
                        onChange={(e) => setNamaWakif(e.target.value)}
                        required
                      />

                      <label className="block text-sm font-medium text-gray-400 mt-6">
                        Luas Tanah
                      </label>
                      <input
                        type="text"
                        className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                        value={luasTanah}
                        onChange={(e) => setLuasTanah(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {/* Tombol Simpan */}
                  <div className="flex justify-center mt-8">
                    <button
                      type="submit"
                      className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB]"
                    >
                      Simpan
                    </button>
                  </div>
                </form>

                {/* Tabel Sertifikat */}
                <div className="mt-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Legalitas</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateLegalitas}
                        className="bg-[#3B82F6] text-white px-2 py-2 text-xs rounded-md hover:bg-[#2563EB] flex items-center"
                      >
                        <FaPlus className="mr-2 text-xs" />
                        Create
                      </button>
                      <button
                        onClick={() =>
                          handleUpdateLegalitas(
                            sertifikatList[0]?.id_sertifikat
                          )
                        } // Gunakan ID sertifikat yang sudah ada
                        className="bg-[#F59E0B] text-white text-xs px-2 py-2 rounded-md hover:bg-[#D97706] flex items-center"
                        disabled={!sertifikatList.length} // Nonaktifkan tombol jika tidak ada sertifikat
                      >
                        <FaEdit className="mr-2 text-xs" />
                        Update
                      </button>
                    </div>
                  </div>
                  <table className="min-w-full text-xs bg-white border border-gray-300">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 font-medium border-b-2">No</th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          No Dokumen
                        </th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          Legalitas
                        </th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          Tanggal
                        </th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          Dokumen Legalitas
                        </th>
                        {isPimpinanJamaah && (
                          <th className="px-4 py-2 text-center font-medium">
                            Status
                          </th>
                        )}
                        <th className="py-2 px-4 font-medium border-b-2">
                          Keterangan
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sertifikatList.length > 0 ? (
                        <tr key={sertifikatList[0].id_sertifikat}>
                          <td className="py-2 px-4 border-b text-center">1</td>
                          <td className="py-2 px-4 border-b text-center">
                            {sertifikatList[0].noDokumenBastw ||
                              sertifikatList[0].noDokumenAIW ||
                              sertifikatList[0].noDokumenSW}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <div
                              className={`inline-block px-8 py-2 rounded-[30px] ${
                                sertifikatList[0]?.legalitas?.toLowerCase() ===
                                "BASTW Terbit"
                                  ? "bg-[#AFFEB5] text-[#187556]"
                                  : sertifikatList[0]?.legalitas?.toLowerCase() ===
                                    "AIW Terbit"
                                  ? "bg-[#AFFEB5] text-[#187556]"
                                  : sertifikatList[0]?.legalitas?.toLowerCase() ===
                                    "Sertifikat Terbit"
                                  ? "bg-[#AFFEB5] text-[#187556]"
                                  : sertifikatList[0]?.legalitas?.toLowerCase() ===
                                    "AIW ditolak"
                                  ? "bg-[#FEC5D0] text-[#D80027]"
                                  : sertifikatList[0]?.legalitas?.toLowerCase() ===
                                    "Sertifikat ditolak"
                                  ? "bg-[#FEC5D0] text-[#D80027]"
                                  : sertifikatList[0]?.legalitas
                                      ?.trim()
                                      .toLowerCase() === "Proses BASTW"
                                  ? "bg-[#FFEFBA] text-[#FECC23]"
                                  : sertifikatList[0]?.legalitas?.toLowerCase() ===
                                    "Proses AIW"
                                  ? "bg-[#FFEFBA] text-[#FECC23]"
                                  : sertifikatList[0]?.legalitas?.toLowerCase() ===
                                    "Proses Sertifikat"
                                  ? "bg-[#FFEFBA] text-[#FECC23]"
                                  : ""
                              }`}
                            >
                              {sertifikatList[0].legalitas}
                            </div>
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {new Date(
                              sertifikatList[0].created_at
                            ).toLocaleDateString()}
                          </td>
                          <td className="py-5 flex items-center justify-center">
                            <button
                              onClick={() =>
                                handlePreviewDokumen(sertifikatList[0].dokBastw)
                              }
                              className="text-blue-500 hover:text-blue-700 flex items-center justify-center"
                            >
                              <FaEye />
                            </button>
                          </td>
                          <td className="text-xs text-center px-4 py-2 whitespace-nowrap font-semibold">
                            <div
                              className={`inline-block px-4 py-2 rounded-[30px] ${
                                sertifikatList[0]?.status?.toLowerCase() ===
                                "disetujui"
                                  ? "bg-[#AFFEB5] text-[#187556]"
                                  : sertifikatList[0]?.status?.toLowerCase() ===
                                    "ditolak"
                                  ? "bg-[#FEC5D0] text-[#D80027]"
                                  : sertifikatList[0]?.status?.toLowerCase() ===
                                    "ditinjau"
                                  ? "bg-[#FFEFBA] text-[#FECC23]"
                                  : ""
                              }`}
                            >
                              {sertifikatList[0].status}
                            </div>
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {calculateDayDifference(
                              sertifikatList[0].created_at
                            )}
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="py-2 px-4 border-b text-center"
                          >
                            Tidak ada data sertifikat.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default EditTanah;
