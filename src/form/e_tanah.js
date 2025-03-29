import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaPlus, FaEdit } from "react-icons/fa";
import { getUserId, getRoleId } from "../utils/Auth";
import Swal from "sweetalert2";

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
  const [tanahData, setTanahData] = useState(null);

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
  const lokasiLengkap = `${
    provinsiList.find((p) => p.id === provinsi)?.name
  }, ${kotaList.find((k) => k.id === kota)?.name}, ${
    kecamatanList.find((k) => k.id === kecamatan)?.name
  }, ${kelurahanList.find((k) => k.id === kelurahan)?.name}, ${detailLokasi}`;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLegalitas, setSelectedLegalitas] = useState("");
  const [legalitasOptions, setLegalitasOptions] = useState([
    "Proses BASTW",
    "BASTW Terbit",
    "Proses AIW",
    "AIW Terbit",
    "Proses Sertifikat",
    "Sertifikat Terbit",
    "AIW ditolak",
    "Sertifikat ditolak",
  ]);

  const API_KEY = "231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d";

  useEffect(() => {
    fetchTanah();
    fetchSertifikat();
    fetchUserRole();
  }, []);

  const findWilayahId = (list, name) => {
    const found = list.find(item => item.name === name);
    return found ? found.id : '';
  };

  // Ambil data pengguna
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "warning",
          title: "Peringatan!",
          text: "Anda harus login untuk mengupdate legalitas.",
          confirmButtonText: "OK",
        });
        return;
      }
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/data/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

// 1. Fetch Provinsi
useEffect(() => {
  const fetchProvinsi = async () => {
    try {
      const response = await axios.get(
        `https://api.binderbyte.com/wilayah/provinsi?api_key=${API_KEY}`
      );
      setProvinsiList(response.data.value);
    } catch (error) {
      console.error("Error fetching provinsi:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat data provinsi',
        text: 'Silakan coba lagi atau hubungi admin',
      });
    }
  };
  fetchProvinsi();
}, []);

// 2. Fetch Kabupaten/Kota ketika provinsi dipilih
useEffect(() => {
  const fetchKota = async () => {
    if (!provinsi) return;
    
    try {
      const response = await axios.get(
        `https://api.binderbyte.com/wilayah/kabupaten?api_key=${API_KEY}&id_provinsi=${provinsi}`
      );
      setKotaList(response.data.value);
      setKota(""); // Reset kabupaten ketika provinsi berubah
      setKecamatan(""); // Reset kecamatan
      setKelurahan(""); // Reset kelurahan
    } catch (error) {
      console.error("Error fetching kabupaten:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat data kabupaten',
        text: 'Silakan coba lagi atau hubungi admin',
      });
    }
  };
  fetchKota();
}, [provinsi]);

// 3. Fetch Kecamatan ketika kabupaten dipilih
useEffect(() => {
  const fetchKecamatan = async () => {
    if (!kota) return;
    
    try {
      const response = await axios.get(
        `https://api.binderbyte.com/wilayah/kecamatan?api_key=${API_KEY}&id_kabupaten=${kota}`
      );
      setKecamatanList(response.data.value || []);
      setKecamatan(""); // Reset kecamatan ketika kabupaten berubah
      setKelurahan(""); // Reset kelurahan
    } catch (error) {
      console.error("Error fetching kecamatan:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat data kecamatan',
        text: 'Silakan coba lagi atau hubungi admin',
      });
    }
  };
  fetchKecamatan();
}, [kota]);

// 4. Fetch Kelurahan/Desa ketika kecamatan dipilih
useEffect(() => {
  const fetchKelurahan = async () => {
    if (!kecamatan) return;
    
    try {
      const response = await axios.get(
        `https://api.binderbyte.com/wilayah/kelurahan?api_key=${API_KEY}&id_kecamatan=${kecamatan}`
      );
      setKelurahanList(response.data.value || []);
      setKelurahan(""); // Reset kelurahan ketika kecamatan berubah
    } catch (error) {
      console.error("Error fetching kelurahan:", error);
      Swal.fire({
        icon: 'error',
        title: 'Gagal memuat data kelurahan',
        text: 'Silakan coba lagi atau hubungi admin',
      });
    }
  };
  fetchKelurahan();
}, [kecamatan]);

// Fungsi untuk mengisi dropdown otomatis dari data yang sudah ada
const initWilayahFromData = async (lokasi) => {
  if (!lokasi) return;
  
  const [provName, kabName, kecName, kelName] = lokasi.split(', ');
  
  // 1. Set Provinsi
  const prov = provinsiList.find(p => p.name === provName);
  if (prov) {
    setProvinsi(prov.id);
    
    // Tunggu data kabupaten terload
    await new Promise(resolve => setTimeout(resolve, 500));
    const kab = kotaList.find(k => k.name === kabName);
    if (kab) {
      setKota(kab.id);
      
      // Tunggu data kecamatan terload
      await new Promise(resolve => setTimeout(resolve, 500));
      const kec = kecamatanList.find(k => k.name === kecName);
      if (kec) {
        setKecamatan(kec.id);
        
        // Tunggu data kelurahan terload
        await new Promise(resolve => setTimeout(resolve, 500));
        const kel = kelurahanList.find(k => k.name === kelName);
        if (kel) setKelurahan(kel.id);
      }
    }
  }
};

// Gunakan initWilayahFromData saat data tanah di-load
useEffect(() => {
  if (tanahData?.lokasi && provinsiList.length > 0) {
    initWilayahFromData(tanahData.lokasi);
  }
}, [tanahData, provinsiList]);

const fetchTanah = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    Swal.fire({
      icon: "warning",
      title: "Peringatan!",
      text: "Anda harus login untuk mengedit data.",
      confirmButtonText: "OK",
    });
    navigate("/dashboard");
    return;
  }

  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/tanah/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const tanah = response.data.data[0] || response.data.data;
    setTanahData(tanah); // Simpan data tanah
    
    if (tanah) {
      setNamaPimpinanJamaah(tanah.NamaPimpinanJamaah || "");
      setNamaWakif(tanah.NamaWakif || "");
      setLuasTanah(tanah.luasTanah || "");
      
      if (tanah.lokasi) {
        const [provName, kabName, kecName, kelName, detail] = tanah.lokasi.split(', ');
        setDetailLokasi(detail || "");
      }
    }
    setLoading(false);
  } catch (error) {
    console.error("Gagal mengambil data tanah:", error);
    Swal.fire({
      icon: "error",
      title: "Gagal!",
      text: "Gagal mengambil data tanah.",
      confirmButtonText: "OK",
    });
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
      // test
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

    // Validasi data lokasi
    if (!provinsi || !kota || !kecamatan || !kelurahan || !detailLokasi) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan!",
        text: "Harap lengkapi semua data lokasi",
        confirmButtonText: "OK",
      });
      return;
    }

    // Buat string lokasi lengkap
    const lokasiLengkap = `${
      provinsiList.find((p) => p.id === provinsi)?.name || ""
    }, ${kotaList.find((k) => k.id === kota)?.name || ""}, ${
      kecamatanList.find((k) => k.id === kecamatan)?.name || ""
    }, ${kelurahanList.find((k) => k.id === kelurahan)?.name || ""}, ${
      detailLokasi || ""
    }`;

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/tanah/${id}`,
        {
          NamaPimpinanJamaah,
          NamaWakif,
          lokasi: lokasiLengkap, // Gunakan lokasi lengkap
          luasTanah,
          detailLokasi, // Tambahkan detailLokasi jika diperlukan di backend
        },
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
              NamaPimpinanJamaah: NamaPimpinanJamaah,
              NamaWakif: NamaWakif,
              lokasi: lokasiLengkap,
              luasTanah: luasTanah,
            }
          : tanah
      );

      localStorage.setItem("tanahList", JSON.stringify(updatedTanahList));

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data berhasil diperbarui!",
        confirmButtonText: "OK",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Gagal memperbarui data:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat memperbarui data.",
        confirmButtonText: "OK",
      });
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
    console.log("Navigasi ke halaman pembuatan sertifikat");
    navigate("/sertifikat/create");
  };

  const handleUpdateSertifikat = (sertifikatId) => {
    if (sertifikatId) {
      navigate(`/sertifikat/edit/${sertifikatId}`);
    } else {
      Swal.fire({
        icon: "warning",
        title: "Peringatan!",
        text: "Tidak ada sertifikat yang dapat diupdate.",
        confirmButtonText: "OK",
      });
    }
  };

  const dokumenTypes = [
    { key: "noDokumenBastw", label: "BASTW", docKey: "dokBastw" },
    { key: "noDokumenAIW", label: "AIW", docKey: "dokAiw" },
    { key: "noDokumenSW", label: "SW", docKey: "dokSw" },
  ];

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleLegalitasChange = (e) => {
    setSelectedLegalitas(e.target.value);
  };

  const handleUpdateLegalitas = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk mengupdate legalitas.");
      return;
    }

    try {
      await axios.put(
        `http://127.0.0.1:8000/api/sertifikat/legalitas/${sertifikatId}`,
        { legalitas: selectedLegalitas },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Legalitas berhasil diperbarui!",
        confirmButtonText: "OK",
      });
      closeModal();
      fetchSertifikat(); // Refresh data sertifikat setelah update
    } catch (error) {
      console.error("Gagal memperbarui legalitas:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat memperbarui legalitas.",
        confirmButtonText: "OK",
      });
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
                      <select
                        className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                        value={NamaPimpinanJamaah}
                        onChange={(e) => setNamaPimpinanJamaah(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Pilih Pimpinan Jamaah
                        </option>
                        {users.map((user) => (
                          <option key={user.id} value={user.name}>
                            {user.name}
                          </option>
                        ))}
                      </select>
                      {/* Dropdown Provinsi */}
                      <label className="block text-sm font-medium text-gray-400 mt-6">
                        Provinsi
                      </label>
                      <select
                        className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                        value={provinsi}
                        onChange={(e) => setProvinsi(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Pilih Provinsi
                        </option>
                        {provinsiList.map((prov) => (
                          <option key={prov.id} value={prov.id}>
                            {prov.name}
                          </option>
                        ))}
                      </select>

                      {/* Dropdown Kabupaten (Muncul setelah provinsi dipilih) */}
                      {provinsi && (
                        <>
                          <label className="block text-sm font-medium text-gray-400 mt-6">
                            Kabupaten/Kota
                          </label>
                          <select
                            className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                            value={kota}
                            onChange={(e) => setKota(e.target.value)}
                            required
                          >
                            <option value="" disabled>
                              Pilih Kabupaten/Kota
                            </option>
                            {kotaList.map((kab) => (
                              <option key={kab.id} value={kab.id}>
                                {kab.name}
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      {/* Dropdown Kecamatan (Muncul setelah kabupaten dipilih) */}
                      {kota && (
                        <>
                          <label className="block text-sm font-medium text-gray-400 mt-6">
                            Kecamatan
                          </label>
                          <select
                            className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                            value={kecamatan}
                            onChange={(e) => setKecamatan(e.target.value)}
                            required
                          >
                            <option value="" disabled>
                              Pilih Kecamatan
                            </option>
                            {kecamatanList.map((kec) => (
                              <option key={kec.id} value={kec.id}>
                                {kec.name}
                              </option>
                            ))}
                          </select>
                        </>
                      )}

                      {/* Dropdown Kelurahan (Muncul setelah kecamatan dipilih) */}
                      {kecamatan && (
                        <>
                          <label className="block text-sm font-medium text-gray-400 mt-6">
                            Kelurahan/Desa
                          </label>
                          <select
                            className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                            value={kelurahan}
                            onChange={(e) => setKelurahan(e.target.value)}
                            required
                          >
                            <option value="" disabled>
                              Pilih Kelurahan/Desa
                            </option>
                            {kelurahanList.map((kel) => (
                              <option key={kel.id} value={kel.id}>
                                {kel.name}
                              </option>
                            ))}
                          </select>
                        </>
                      )}
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
                      <label className="block text-sm font-medium text-gray-400 mt-6">
                        Detail Lokasi
                      </label>
                      <input
                        type="text"
                        className="w-60 border-b-2 border-gray-300 p-2 focus:outline-none text-left"
                        value={detailLokasi}
                        onChange={(e) => setDetailLokasi(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  {/* Preview Lokasi */}
                  <div className="bg-gray-100 p-4 rounded-md mt-8 shadow-md">
                    <h3 className="text-lg font-semibold text-gray-700">
                      Preview Lokasi:
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {provinsi
                        ? `${
                            provinsiList.find((p) => p.id === provinsi)?.name ||
                            "Belum dipilih"
                          }, `
                        : ""}
                      {kota
                        ? `${
                            kotaList.find((k) => k.id === kota)?.name ||
                            "Belum dipilih"
                          }, `
                        : ""}
                      {kecamatan
                        ? `${
                            kecamatanList.find((k) => k.id === kecamatan)
                              ?.name || "Belum dipilih"
                          }, `
                        : ""}
                      {kelurahan
                        ? `${
                            kelurahanList.find((k) => k.id === kelurahan)
                              ?.name || "Belum dipilih"
                          }, `
                        : ""}
                      {detailLokasi || "Detail lokasi belum diisi"}
                    </p>
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
                          handleUpdateSertifikat(
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
                        sertifikatList.map((sertifikat, index) =>
                          dokumenTypes.map(
                            (type, idx) =>
                              sertifikat[type.key] && (
                                <tr key={`${sertifikat.id_sertifikat}-${idx}`}>
                                  <td className="py-2 px-4 border-b text-center">
                                    {idx + 1}
                                  </td>
                                  <td className="py-2 px-4 border-b text-center">
                                    {sertifikat[type.key]}
                                  </td>
                                  <td className="py-2 px-4 border-b text-center">
                                    <div
                                      className={`inline-block px-8 py-2 rounded-[30px] ${
                                        sertifikat?.legalitas?.toLowerCase() ===
                                          "bastw terbit" ||
                                        sertifikat?.legalitas?.toLowerCase() ===
                                          "aiw terbit" ||
                                        sertifikat?.legalitas?.toLowerCase() ===
                                          "sertifikat terbit"
                                          ? "bg-[#AFFEB5] text-[#187556]"
                                          : sertifikat?.legalitas?.toLowerCase() ===
                                              "aiw ditolak" ||
                                            sertifikat?.legalitas?.toLowerCase() ===
                                              "sertifikat ditolak"
                                          ? "bg-[#FEC5D0] text-[#D80027]"
                                          : sertifikat?.legalitas
                                              ?.toLowerCase()
                                              .includes("proses")
                                          ? "bg-[#FFEFBA] text-[#FECC23]"
                                          : "bg-[#D9D9D9] text-[#7E7E7E]"
                                      }`}
                                    >
                                      {sertifikat.legalitas || "-"}
                                      <button
                                        onClick={openModal}
                                        className="ml-2 bg-[#fff] text-gray-400 px-2 py-1 rounded-md hover:bg-[#848382] hover:text-[#000] text-xs"
                                      >
                                        <FaEdit />
                                      </button>
                                    </div>
                                  </td>
                                  <td className="py-2 px-4 border-b text-center">
                                    {new Date(
                                      sertifikat.created_at
                                    ).toLocaleDateString()}
                                  </td>
                                  <td className="py-5 flex items-center justify-center">
                                    <button
                                      onClick={() =>
                                        handlePreviewDokumen(
                                          sertifikat[type.docKey]
                                        )
                                      }
                                      className="text-blue-500 hover:text-blue-700 flex items-center justify-center"
                                    >
                                      <FaEye />
                                    </button>
                                  </td>
                                  {isPimpinanJamaah && (
                                    <td className="text-xs text-center px-4 py-2 whitespace-nowrap font-semibold">
                                      <div
                                        className={`inline-block px-4 py-2 rounded-[30px] ${
                                          sertifikat?.status?.toLowerCase() ===
                                          "disetujui"
                                            ? "bg-[#AFFEB5] text-[#187556]"
                                            : sertifikat?.status?.toLowerCase() ===
                                              "ditolak"
                                            ? "bg-[#FEC5D0] text-[#D80027]"
                                            : sertifikat?.status?.toLowerCase() ===
                                              "ditinjau"
                                            ? "bg-[#FFEFBA] text-[#FECC23]"
                                            : ""
                                        }`}
                                      >
                                        {sertifikat.status}
                                      </div>
                                    </td>
                                  )}
                                  <td className="py-2 px-4 border-b text-center">
                                    {calculateDayDifference(
                                      sertifikat.created_at
                                    )}
                                  </td>
                                </tr>
                              )
                          )
                        )
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
                  {isModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h2 className="text-xl font-semibold mb-4">
                          Update Legalitas
                        </h2>

                        <label className="block text-sm font-medium text-gray-700">
                          Status Legalitas:
                        </label>
                        <select
                          value={selectedLegalitas}
                          onChange={handleLegalitasChange}
                          className="border p-2 w-full"
                        >
                          {legalitasOptions.map((option, index) => (
                            <option key={index} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>

                        <div className="flex justify-end mt-4">
                          <button
                            className="bg-gray-500 text-white px-4 py-2 rounded-md mr-2"
                            onClick={closeModal}
                          >
                            Batal
                          </button>
                          <button
                            className="hover:bg-[#2563EB] bg-[#3B82F6] text-white px-4 py-2 rounded-md"
                            onClick={handleUpdateLegalitas}
                          >
                            Simpan
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
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
