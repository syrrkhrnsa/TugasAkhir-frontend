import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { FaEye, FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { getUserId, getRoleId } from "../utils/Auth";
import Swal from "sweetalert2";

const EditTanah = () => {
  const { id } = useParams();
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
  const [selectedJenisSertifikat, setSelectedJenisSertifikat] = useState("");
  const [selectedStatusPengajuan, setSelectedStatusPengajuan] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const API_KEY =
    "231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d";

  useEffect(() => {
    fetchTanah();
    fetchSertifikat();
    fetchUserRole();
  }, []);

  const findWilayahId = (list, name) => {
    const found = list.find((item) => item.name === name);
    return found ? found.id : "";
  };

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
          icon: "error",
          title: "Gagal memuat data provinsi",
          text: "Silakan coba lagi atau hubungi admin",
        });
      }
    };
    fetchProvinsi();
  }, []);

  useEffect(() => {
    const fetchKota = async () => {
      if (!provinsi) return;

      try {
        const response = await axios.get(
          `https://api.binderbyte.com/wilayah/kabupaten?api_key=${API_KEY}&id_provinsi=${provinsi}`
        );
        setKotaList(response.data.value);
        setKota("");
        setKecamatan("");
        setKelurahan("");
      } catch (error) {
        console.error("Error fetching kabupaten:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data kabupaten",
          text: "Silakan coba lagi atau hubungi admin",
        });
      }
    };
    fetchKota();
  }, [provinsi]);

  useEffect(() => {
    const fetchKecamatan = async () => {
      if (!kota) return;

      try {
        const response = await axios.get(
          `https://api.binderbyte.com/wilayah/kecamatan?api_key=${API_KEY}&id_kabupaten=${kota}`
        );
        setKecamatanList(response.data.value || []);
        setKecamatan("");
        setKelurahan("");
      } catch (error) {
        console.error("Error fetching kecamatan:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data kecamatan",
          text: "Silakan coba lagi atau hubungi admin",
        });
      }
    };
    fetchKecamatan();
  }, [kota]);

  useEffect(() => {
    const fetchKelurahan = async () => {
      if (!kecamatan) return;

      try {
        const response = await axios.get(
          `https://api.binderbyte.com/wilayah/kelurahan?api_key=${API_KEY}&id_kecamatan=${kecamatan}`
        );
        setKelurahanList(response.data.value || []);
        setKelurahan("");
      } catch (error) {
        console.error("Error fetching kelurahan:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal memuat data kelurahan",
          text: "Silakan coba lagi atau hubungi admin",
        });
      }
    };
    fetchKelurahan();
  }, [kecamatan]);

  const initWilayahFromData = async (lokasi) => {
    if (!lokasi) return;

    const [provName, kabName, kecName, kelName] = lokasi.split(", ");

    const prov = provinsiList.find((p) => p.name === provName);
    if (prov) {
      setProvinsi(prov.id);

      await new Promise((resolve) => setTimeout(resolve, 500));
      const kab = kotaList.find((k) => k.name === kabName);
      if (kab) {
        setKota(kab.id);

        await new Promise((resolve) => setTimeout(resolve, 500));
        const kec = kecamatanList.find((k) => k.name === kecName);
        if (kec) {
          setKecamatan(kec.id);

          await new Promise((resolve) => setTimeout(resolve, 500));
          const kel = kelurahanList.find((k) => k.name === kelName);
          if (kel) setKelurahan(kel.id);
        }
      }
    }
  };

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
      const response = await axios.get(
        `http://127.0.0.1:8000/api/tanah/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const tanah = response.data.data[0] || response.data.data;
      setTanahData(tanah);

      if (tanah) {
        setNamaPimpinanJamaah(tanah.NamaPimpinanJamaah || "");
        setNamaWakif(tanah.NamaWakif || "");
        setLuasTanah(tanah.luasTanah || "");

        if (tanah.lokasi) {
          const [provName, kabName, kecName, kelName, detail] =
            tanah.lokasi.split(", ");
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
      console.error("Error fetching sertifikat:", error);
    }
  };

  const fetchUserRole = () => {
    const role = localStorage.getItem("role");
    setRoleUser(role);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Anda harus login untuk mengedit data.");
      return;
    }

    if (!provinsi || !kota || !kecamatan || !kelurahan || !detailLokasi) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan!",
        text: "Harap lengkapi semua data lokasi",
        confirmButtonText: "OK",
      });
      return;
    }

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
          lokasi: lokasiLengkap,
          luasTanah,
          detailLokasi,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const storedTanahList =
        JSON.parse(localStorage.getItem("tanahList")) || [];
      const updatedTanahList = storedTanahList.map((tanah) =>
        tanah.id_tanah === id
          ? {
              ...tanah,
              NamaPimpinanJamaah,
              NamaWakif,
              lokasi: lokasiLengkap,
              luasTanah,
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
    const today = new Date();
    const targetDate = new Date(dateString);
    const timeDifference = today - targetDate;
    const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    return `${dayDifference} hari`;
  };

  const handlePreviewDokumen = (dokumen) => {
    if (!dokumen) {
      Swal.fire({
        icon: "warning",
        title: "Dokumen Tidak Tersedia",
        text: "Dokumen belum diupload",
        confirmButtonText: "OK",
      });
      return;
    }

    // Jika dokumen adalah PDF
    if (dokumen.endsWith(".pdf")) {
      // Buka PDF di tab baru
      window.open(`http://127.0.0.1:8000/storage/${dokumen}`, "_blank");
    }
    // Jika dokumen adalah gambar (jpg, jpeg, png)
    else if (dokumen.match(/\.(jpg|jpeg|png)$/i)) {
      Swal.fire({
        imageUrl: `http://127.0.0.1:8000/storage/${dokumen}`,
        imageAlt: "Preview Dokumen",
        showConfirmButton: false,
        showCloseButton: true,
        width: "80%",
      });
    }
    // Format dokumen lainnya
    else {
      // Alternatif: download dokumen
      window.open(`http://127.0.0.1:8000/storage/${dokumen}`, "_blank");
    }
  };

  const handleCreateLegalitas = () => {
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

  const openModal = (sertifikat) => {
    setSelectedItem(sertifikat);
    setSelectedJenisSertifikat(sertifikat.jenis_sertifikat || "");
    setSelectedStatusPengajuan(sertifikat.status_pengajuan || "");
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

    if (!token || !selectedItem) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan!",
        text: "Anda harus login untuk mengupdate legalitas.",
        confirmButtonText: "OK",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Update jenis sertifikat jika ada perubahan
      if (
        selectedJenisSertifikat &&
        selectedJenisSertifikat !== selectedItem.jenis_sertifikat
      ) {
        await axios.put(
          `http://127.0.0.1:8000/api/sertifikat/jenissertifikat/${selectedItem.id_sertifikat}`,
          { jenis_sertifikat: selectedJenisSertifikat },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      // Update status pengajuan jika ada perubahan
      if (
        selectedStatusPengajuan &&
        selectedStatusPengajuan !== selectedItem.status_pengajuan
      ) {
        await axios.put(
          `http://127.0.0.1:8000/api/sertifikat/statuspengajuan/${selectedItem.id_sertifikat}`,
          { status_pengajuan: selectedStatusPengajuan },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Legalitas berhasil diperbarui!",
        confirmButtonText: "OK",
      });

      fetchSertifikat();
      closeModal();
    } catch (error) {
      console.error("Gagal memperbarui legalitas:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text:
          error.response?.data?.message ||
          "Terjadi kesalahan saat memperbarui legalitas.",
        confirmButtonText: "OK",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteSertifikat = async (sertifikatId) => {
    const result = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Data sertifikat akan dihapus permanen!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Anda harus login untuk menghapus data",
        });
        return;
      }

      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/sertifikat/${sertifikatId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === "success") {
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: response.data.message,
          });
          fetchSertifikat(); // Refresh the list
        }
      } catch (error) {
        console.error("Error deleting sertifikat:", error);
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: error.response?.data?.message || "Gagal menghapus sertifikat",
        });
      }
    }
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-6 mx-auto w-[95%]"
            style={{
              boxShadow:
                "0px 5px 15px rgba(0, 0, 0, 0.1), 0px -5px 15px rgba(0, 0, 0, 0.1), 5px 0px 15px rgba(0, 0, 0, 0.1), -5px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Edit</span>{" "}
              <span className="text-[#187556]">Tanah</span>
            </h2>
            <p className="text-center text-gray-500 text-xs">PC Persis Banjaran</p>

            {loading ? (
              <p className="text-center text-gray-500 mt-6">Memuat data...</p>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="mt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Kolom 1: Pimpinan Jamaah dan Lokasi */}
                    <div className="lg:col-span-3 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Pimpinan Jamaah
                        </label>
                        <select
                          className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-[#187556] text-xs"
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
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Provinsi
                        </label>
                        <select
                          className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-[#187556] text-xs"
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
                      </div>

                      {provinsi && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Kabupaten/Kota
                          </label>
                          <select
                            className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-[#187556] text-xs"
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
                        </div>
                      )}

                      {kota && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Kecamatan
                          </label>
                          <select
                            className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-[#187556] text-xs"
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
                        </div>
                      )}

                      {kecamatan && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Kelurahan/Desa
                          </label>
                          <select
                            className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-[#187556] text-xs"
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
                        </div>
                      )}
                    </div>

                    {/* Kolom 2: Form fields */}
                    <div className="lg:col-span-3 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Nama Wakif
                        </label>
                        <input
                          type="text"
                          className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-[#187556] text-xs"
                          value={NamaWakif}
                          onChange={(e) => setNamaWakif(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Luas Tanah (m²)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-[#187556] text-xs pr-8"
                            value={luasTanah
                              .replace(/\D/g, "")
                              .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(/\D/g, "");
                              setLuasTanah(numericValue);
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Detail Lokasi
                        </label>
                        <input
                          type="text"
                          className="w-full border-b border-gray-300 p-1 focus:outline-none focus:border-[#187556] text-xs"
                          value={detailLokasi}
                          onChange={(e) => setDetailLokasi(e.target.value)}
                          required
                        />
                      </div>

                      {/* Preview Lokasi */}
                      <div className="bg-gray-50 p-2 rounded-md text-xs">
                        <h3 className="font-medium text-gray-700 mb-1">
                          Preview Lokasi:
                        </h3>
                        <p className="text-gray-600">
                          {detailLokasi || "Detail lokasi belum diisi"}
                          {kelurahan
                            ? `, ${
                                kelurahanList.find((k) => k.id === kelurahan)
                                  ?.name || "Belum dipilih"
                              }`
                            : ""}
                          {kecamatan
                            ? `, ${
                                kecamatanList.find((k) => k.id === kecamatan)
                                  ?.name || "Belum dipilih"
                              }`
                            : ""}
                          {kota
                            ? `, ${
                                kotaList.find((k) => k.id === kota)?.name ||
                                "Belum dipilih"
                              }`
                            : ""}
                          {provinsi
                            ? `, ${
                                provinsiList.find((p) => p.id === provinsi)?.name ||
                                "Belum dipilih"
                              }`
                            : ""}
                        </p>
                      </div>

                      <div className="flex justify-center pt-2">
                        <button
                          type="submit"
                          className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB]"
                        >
                          Simpan
                        </button>
                      </div>
                    </div>

                    {/* Kolom 3: Legalitas Table - Wider column */}
                    <div className="lg:col-span-6 space-y-3">
                      <div className="flex justify-between items-center">
                        <button
                          onClick={() =>
                            navigate("/sertifikat/create", {
                              state: {
                                idTanah: tanahData.id_tanah,
                                pimpinanName: tanahData.pimpinan_jamaah?.nama,
                              },
                            })
                          }
                          className="bg-[#3B82F6] text-white px-2 py-1 text-xs rounded hover:bg-[#2563EB] flex items-center"
                        >
                          <FaPlus className="mr-1 text-xs" />
                          Create Sertifikat
                        </button>
                      </div>

                      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">
                                No
                              </th>
                              <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">
                                No Dokumen
                              </th>
                              <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">
                                Legalitas
                              </th>
                              <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              {isPimpinanJamaah && (
                                <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">
                                  Approval
                                </th>
                              )}
                              <th className="px-2 py-1 text-left font-medium text-gray-500 uppercase tracking-wider">
                                Aksi
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {sertifikatList.length > 0 ? (
                              sertifikatList.map((sertifikat, index) => (
                                <tr key={sertifikat.id_sertifikat}>
                                  <td className="px-2 py-1 whitespace-nowrap text-gray-500">
                                    {index + 1}
                                  </td>
                                  <td className="px-2 py-1 whitespace-nowrap text-gray-500">
                                    {sertifikat.no_dokumen || "-"}
                                  </td>
                                  <td className="px-2 py-1 whitespace-nowrap font-medium text-gray-700">
                                    {sertifikat.jenis_sertifikat || "-"}
                                  </td>
                                  <td className="px-2 py-1 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <span
                                        className={`px-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                          sertifikat.status_pengajuan === "Terbit"
                                            ? "bg-green-100 text-green-800"
                                            : sertifikat.status_pengajuan === "Ditolak"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {sertifikat.status_pengajuan || "Proses"}
                                      </span>
                                      <button
                                        className="ml-1 bg-gray-100 text-gray-700 px-1 py-0.5 rounded hover:bg-gray-200 text-xs"
                                        onClick={() => openModal(sertifikat)}
                                      >
                                        <FaEdit size={10} />
                                      </button>
                                    </div>
                                  </td>
                                  {isPimpinanJamaah && (
                                    <td className="px-2 py-1 whitespace-nowrap">
                                      <span
                                        className={`px-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                                          sertifikat.status === "disetujui"
                                            ? "bg-green-100 text-green-800"
                                            : sertifikat.status === "ditolak"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                        }`}
                                      >
                                        {sertifikat.status || "-"}
                                      </span>
                                    </td>
                                  )}
                                  <td className="px-2 py-1 whitespace-nowrap">
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() =>
                                          handlePreviewDokumen(sertifikat.dokumen)
                                        }
                                        className="text-blue-500 hover:text-blue-700 p-0.5"
                                        title="Lihat Dokumen"
                                      >
                                        <FaEye size={10} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleUpdateSertifikat(
                                            sertifikat.id_sertifikat
                                          )
                                        }
                                        className="text-yellow-500 hover:text-yellow-700 p-0.5"
                                        title="Edit"
                                      >
                                        <FaEdit size={10} />
                                      </button>
                                      <button
                                        onClick={() =>
                                          handleDeleteSertifikat(
                                            sertifikat.id_sertifikat
                                          )
                                        }
                                        className="text-red-500 hover:text-red-700 p-0.5"
                                        title="Hapus"
                                      >
                                        <FaTrash size={10} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td
                                  colSpan={isPimpinanJamaah ? 6 : 5}
                                  className="px-3 py-2 text-center text-xs text-gray-500"
                                >
                                  Tidak ada data sertifikat
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </form>

                {isModalOpen && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                      <div className="p-4">
                        <h3 className="text-sm font-medium leading-6 text-gray-900">
                          Update Legalitas
                        </h3>

                        {/* Dropdown Jenis Sertifikat */}
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Jenis Sertifikat
                          </label>
                          <select
                            value={selectedJenisSertifikat}
                            onChange={(e) =>
                              setSelectedJenisSertifikat(e.target.value)
                            }
                            className="mt-1 block w-full pl-2 pr-8 py-1.5 text-xs border border-gray-300 focus:outline-none focus:ring-[#187556] focus:border-[#187556] rounded"
                          >
                            <option value="">Pilih Jenis Sertifikat</option>
                            <option value="BASTW">BASTW</option>
                            <option value="AIW">AIW</option>
                            <option value="SW">SW</option>
                          </select>
                        </div>

                        {/* Dropdown Status Pengajuan */}
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Status Pengajuan
                          </label>
                          <select
                            value={selectedStatusPengajuan}
                            onChange={(e) =>
                              setSelectedStatusPengajuan(e.target.value)
                            }
                            className="mt-1 block w-full pl-2 pr-8 py-1.5 text-xs border border-gray-300 focus:outline-none focus:ring-[#187556] focus:border-[#187556] rounded"
                          >
                            <option value="">Pilih Status</option>
                            <option value="Proses">Proses</option>
                            <option value="Terbit">Terbit</option>
                            <option value="Tolak">Tolak</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-lg">
                        <button
                          type="button"
                          onClick={closeModal}
                          className="mr-3 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556]"
                        >
                          Batal
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateLegalitas}
                          disabled={
                            !selectedJenisSertifikat &&
                            !selectedStatusPengajuan
                          }
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#187556] hover:bg-[#146347] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#187556] disabled:opacity-50"
                        >
                          {isProcessing ? "Menyimpan..." : "Simpan Perubahan"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                </>
              )}
            </div>
          </div>
        </Sidebar>
      </div>
      );
    };
export default EditTanah;