import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import {
  FaEye,
  FaPlus,
  FaEdit,
  FaTrash,
  FaHistory,
  FaDownload,
} from "react-icons/fa";
import { getUserId, getRoleId } from "../utils/Auth";
import Swal from "sweetalert2";
import config from "../config";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import PopupListDokumen from "../components/popup_listdokumen";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Komponen untuk memilih lokasi di peta
const LocationPicker = ({ onLocationSelect, initialPosition }) => {
  const [position, setPosition] = useState(initialPosition);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position ? (
    <Marker position={position}>
      <Popup>Lokasi yang dipilih</Popup>
    </Marker>
  ) : null;
};

const EditTanah = () => {
  const [showDokumenPopup, setShowDokumenPopup] = useState(false);
  const [selectedSertifikatId, setSelectedSertifikatId] = useState(null);

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

  const [calculateLuas, setCalculateLuas] = useState(false);

  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapPosition, setMapPosition] = useState([-7.0425, 107.5861]);

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
  const [jenisTanah, setJenisTanah] = useState("");
  const [batasTimur, setBatasTimur] = useState("");
  const [batasSelatan, setBatasSelatan] = useState("");
  const [batasBarat, setBatasBarat] = useState("");
  const [batasUtara, setBatasUtara] = useState("");
  const [panjangTanah, setPanjangTanah] = useState("");
  const [lebarTanah, setLebarTanah] = useState("");
  const [catatan, setCatatan] = useState("");
  const [alamatWakif, setAlamatWakif] = useState("");
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

  const handleLocationSelect = (latlng) => {
    setSelectedLocation(latlng);
  };

  useEffect(() => {
    fetchTanah();
    fetchSertifikat();
    fetchUserRole();
  }, []);

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

  const jenisTanahOptions = [
    { value: "", label: "Pilih Jenis Tanah" },
    { value: "Darat", label: "Darat" },
    { value: "Sawah", label: "Sawah" },
  ];

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
        setJenisTanah(tanah.jenis_tanah || "");
        setBatasTimur(tanah.batas_timur || "");
        setBatasSelatan(tanah.batas_selatan || "");
        setBatasBarat(tanah.batas_barat || "");
        setBatasUtara(tanah.batas_utara || "");
        setPanjangTanah(tanah.panjang_tanah || "");
        setLebarTanah(tanah.lebar_tanah || "");
        setCatatan(tanah.catatan || "");
        setAlamatWakif(tanah.alamat_wakif || "");

        // Set koordinat jika ada
        if (tanah.latitude && tanah.longitude) {
          setSelectedLocation({
            lat: parseFloat(tanah.latitude),
            lng: parseFloat(tanah.longitude),
          });
        }

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

  const handleOpenMap = () => {
    // Jika sudah ada lokasi terpilih, set posisi peta ke lokasi tersebut
    if (selectedLocation) {
      setMapPosition([selectedLocation.lat, selectedLocation.lng]);
    } else if (tanahData?.latitude && tanahData?.longitude) {
      // Jika ada data koordinat di database, gunakan itu
      setMapPosition([
        parseFloat(tanahData.latitude),
        parseFloat(tanahData.longitude),
      ]);
    } else {
      // Jika belum ada lokasi terpilih, coba dapatkan lokasi user
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setMapPosition([latitude, longitude]);
          },
          () => {
            // Jika gagal dapatkan lokasi, gunakan default
            setMapPosition([-7.0425, 107.5861]);
          }
        );
      } else {
        setMapPosition([-7.0425, 107.5861]);
      }
    }
    setShowMap(true);
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

    const data = {
      NamaPimpinanJamaah,
      NamaWakif,
      lokasi: lokasiLengkap,
      luasTanah,
      detailLokasi,
      jenis_tanah: jenisTanah,
      batas_timur: batasTimur,
      batas_selatan: batasSelatan,
      batas_barat: batasBarat,
      batas_utara: batasUtara,
      panjang_tanah: panjangTanah,
      lebar_tanah: lebarTanah,
      catatan: catatan,
      alamat_wakif: alamatWakif,
    };

    // Tambahkan koordinat jika ada
    if (selectedLocation) {
      data.latitude = selectedLocation.lat;
      data.longitude = selectedLocation.lng;
    } else if (tanahData?.latitude && tanahData?.longitude) {
      // Jika tidak ada perubahan, gunakan data yang sudah ada
      data.latitude = tanahData.latitude;
      data.longitude = tanahData.longitude;
    }

    try {
      await axios.put(`http://127.0.0.1:8000/api/tanah/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

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

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

  useEffect(() => {
    if (calculateLuas && panjangTanah && lebarTanah) {
      const luas = parseFloat(panjangTanah) * parseFloat(lebarTanah);
      setLuasTanah(luas.toString());
    }
  }, [panjangTanah, lebarTanah, calculateLuas]);

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

  const handleShowDokumenList = (sertifikatId) => {
    setSelectedSertifikatId(sertifikatId);
    setShowDokumenPopup(true);
  };

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[80%] max-w-5xl"
            style={{
              boxShadow:
                "0px 5px 15px rgba(0, 0, 0, 0.1), 0px -5px 15px rgba(0, 0, 0, 0.1), 5px 0px 15px rgba(0, 0, 0, 0.1), -5px 0px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 className="text-center text-3xl font-bold">
              <span className="text-[#FECC23]">Edit</span>{" "}
              <span className="text-[#187556]">Tanah</span>
            </h2>
            <p className="text-center text-gray-500">PC Persis Banjaran</p>

            {loading ? (
              <p className="text-center text-gray-500 mt-6">Memuat data...</p>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Kolom kiri */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Pimpinan Jamaah
                        </label>
                        <select
                          className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
                          value={NamaPimpinanJamaah}
                          onChange={(e) =>
                            setNamaPimpinanJamaah(e.target.value)
                          }
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
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Nama Wakif
                        </label>
                        <input
                          type="text"
                          className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
                          value={NamaWakif}
                          onChange={(e) => setNamaWakif(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Pilih Lokasi di Peta
                        </label>
                        <div className="flex flex-col space-y-2">
                          <button
                            type="button"
                            onClick={handleOpenMap}
                            className="bg-[#187556] text-white px-4 py-2 rounded-md hover:bg-[#0e5a3f] flex items-center justify-center"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            {selectedLocation ? "Ubah Lokasi" : "Pilih Lokasi"}
                          </button>
                          {selectedLocation && (
                            <div className="bg-gray-100 p-3 rounded-md">
                              <p className="text-sm font-medium text-gray-700">
                                Koordinat Terpilih:
                              </p>
                              <p className="text-sm text-gray-600">
                                Latitude: {selectedLocation.lat.toFixed(6)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Longitude: {selectedLocation.lng.toFixed(6)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Provinsi
                        </label>
                        <select
                          className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
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
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Kabupaten/Kota
                          </label>
                          <select
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
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
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Kecamatan
                          </label>
                          <select
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
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
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Kelurahan/Desa
                          </label>
                          <select
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
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

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Catatan
                        </label>
                        <textarea
                          className="w-full border-2 border-gray-300 rounded-md p-2 focus:outline-none focus:border-[#187556] text-left"
                          rows="3"
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          placeholder="Tambahkan catatan jika diperlukan"
                        />
                      </div>
                    </div>

                    {/* Kolom kanan */}
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Jenis Tanah
                        </label>
                        <select
                          className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
                          value={jenisTanah}
                          onChange={(e) => setJenisTanah(e.target.value)}
                        >
                          {jenisTanahOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Panjang Tanah (m)
                          </label>
                          <input
                            type="number"
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
                            value={panjangTanah}
                            onChange={(e) => {
                              setPanjangTanah(e.target.value);
                              setCalculateLuas(true);
                            }}
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Lebar Tanah (m)
                          </label>
                          <input
                            type="number"
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
                            value={lebarTanah}
                            onChange={(e) => {
                              setLebarTanah(e.target.value);
                              setCalculateLuas(true);
                            }}
                            placeholder="0"
                            step="0.01"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Luas Tanah (m²)
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t pr-10"
                            value={
                              luasTanah
                                ? formatNumber(
                                    parseFloat(luasTanah).toLocaleString(
                                      "id-ID"
                                    )
                                  )
                                : ""
                            }
                            onChange={(e) => {
                              const numericValue = e.target.value.replace(
                                /\D/g,
                                ""
                              );
                              setLuasTanah(numericValue);
                              setCalculateLuas(false);
                            }}
                            required
                          />
                          <span className="absolute right-2 top-2 text-gray-500">
                            m²
                          </span>
                        </div>
                        {calculateLuas && panjangTanah && lebarTanah && (
                          <p className="text-xs text-gray-500 mt-1">
                            Dihitung otomatis: {panjangTanah}m × {lebarTanah}m ={" "}
                            {formatNumber(
                              (
                                parseFloat(panjangTanah) *
                                parseFloat(lebarTanah)
                              ).toLocaleString("id-ID")
                            )}
                            m²
                          </p>
                        )}
                      </div>

                      {/* Batas Timur dan Selatan */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Batas Timur
                          </label>
                          <input
                            type="text"
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left"
                            value={batasTimur}
                            onChange={(e) => setBatasTimur(e.target.value)}
                            placeholder="Batas timur"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Batas Selatan
                          </label>
                          <input
                            type="text"
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left"
                            value={batasSelatan}
                            onChange={(e) => setBatasSelatan(e.target.value)}
                            placeholder="Batas selatan"
                          />
                        </div>
                      </div>

                      {/* Batas Barat dan Utara */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Batas Barat
                          </label>
                          <input
                            type="text"
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left"
                            value={batasBarat}
                            onChange={(e) => setBatasBarat(e.target.value)}
                            placeholder="Batas barat"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600 mb-1">
                            Batas Utara
                          </label>
                          <input
                            type="text"
                            className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left"
                            value={batasUtara}
                            onChange={(e) => setBatasUtara(e.target.value)}
                            placeholder="Batas utara"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Detail Lokasi
                        </label>
                        <input
                          type="text"
                          className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
                          value={detailLokasi}
                          onChange={(e) => setDetailLokasi(e.target.value)}
                          required
                          placeholder="Detail alamat (nama jalan, nomor, dll)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">
                          Alamat Wakif
                        </label>
                        <input
                          type="text"
                          className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
                          value={alamatWakif}
                          onChange={(e) => setAlamatWakif(e.target.value)}
                          placeholder="Alamat lengkap wakif"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bagian bawah form (full width) */}
                  <div className="mt-6 space-y-6">
                    {/* Preview Lokasi */}
                    <div className="bg-gray-100 p-4 rounded-md shadow-inner">
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        Lokasi Tanah Wakaf:
                      </h3>
                      <p className="text-gray-600">
                        {detailLokasi || "-"}
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
                              provinsiList.find((p) => p.id === provinsi)
                                ?.name || "Belum dipilih"
                            }`
                          : ""}
                      </p>
                    </div>
                  </div>

                  {/* Tombol Simpan */}
                  <div className="flex justify-center mt-8">
                    <button
                      type="submit"
                      className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB]"
                    >
                      Simpan Perubahan
                    </button>
                  </div>
                </form>

                {showMap && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
                      <div className="p-4 border-b flex justify-between items-center">
                        <h3 className="text-lg font-semibold">
                          Pilih Lokasi Tanah
                        </h3>
                        <button
                          onClick={() => setShowMap(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                      <div className="flex-1 relative">
                        <MapContainer
                          center={mapPosition}
                          zoom={15}
                          style={{ height: "100%", width: "100%" }}
                          className="z-0"
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <LocationPicker
                            onLocationSelect={handleLocationSelect}
                            initialPosition={
                              selectedLocation
                                ? [selectedLocation.lat, selectedLocation.lng]
                                : null
                            }
                          />
                        </MapContainer>
                      </div>
                      <div className="p-4 border-t flex justify-end space-x-2">
                        <button
                          onClick={() => setShowMap(false)}
                          className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                        >
                          Batal
                        </button>
                        <button
                          onClick={() => setShowMap(false)}
                          className="px-4 py-2 bg-[#187556] text-white rounded-md hover:bg-[#0e5a3f]"
                          disabled={!selectedLocation}
                        >
                          Simpan Lokasi
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-10">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Legalitas</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          navigate(`/log?type=sertifikat&id_tanah=${id}`)
                        }
                        className="bg-[#10B981] text-white px-2 py-2 text-xs rounded-md hover:bg-[#059669] flex items-center"
                      >
                        <FaHistory className="mr-2 text-xs" />
                        Riwayat Perubahan Dokumen
                      </button>
                      <button
                        onClick={() =>
                          navigate("/sertifikat/create", {
                            state: {
                              idTanah: tanahData.id_tanah,
                              pimpinanName: tanahData.pimpinan_jamaah?.nama,
                            },
                          })
                        }
                        className="bg-[#3B82F6] text-white px-2 py-2 text-xs rounded-md hover:bg-[#2563EB] flex items-center"
                      >
                        <FaPlus className="mr-2 text-xs" />
                        Tambah Dokumen Persyaratan
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
                          Tanggal Pengajuan
                        </th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          Dokumen
                        </th>
                        {isPimpinanJamaah && (
                          <th className="px-4 py-2 text-center font-medium border-b-2">
                            Status Pengajuan
                          </th>
                        )}
                        <th className="py-2 px-4 font-medium border-b-2">
                          Keterangan
                        </th>
                        <th className="py-2 px-4 font-medium border-b-2">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sertifikatList.length > 0 ? (
                        sertifikatList.map((sertifikat, index) => (
                          <tr key={sertifikat.id_sertifikat}>
                            <td className="py-2 px-4 border-b text-center">
                              {index + 1}
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              {sertifikat.no_dokumen || "-"}
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              <div
                                className={`inline-block px-4 py-1 rounded-[30px] ${
                                  sertifikat.status_pengajuan === "Terbit"
                                    ? "bg-[#AFFEB5] text-[#187556]"
                                    : sertifikat.status_pengajuan === "Ditolak"
                                    ? "bg-[#FEC5D0] text-[#D80027]"
                                    : "bg-[#fffcd6] text-[#FECC23]"
                                }`}
                              >
                                {`${sertifikat.status_pengajuan || "Proses"} ${
                                  sertifikat.jenis_sertifikat || ""
                                }`}
                                <button
                                  className="ml-2 bg-[#fff] text-[#000] px-2 py-1 rounded-md hover:bg-[#848483] hover:text-[#000] text-xs"
                                  onClick={() => openModal(sertifikat)}
                                >
                                  <FaEdit />
                                </button>
                              </div>
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              {sertifikat.tanggal_pengajuan
                                ? new Date(
                                    sertifikat.tanggal_pengajuan
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              <button
                                onClick={() =>
                                  handleShowDokumenList(
                                    sertifikat.id_sertifikat
                                  )
                                }
                               className="text-blue-500 hover:text-blue-700 flex items-center"
                              >
                              <FaEye className="mr-1" />
                                Lihat Dokumen
                              </button>
                            </td>
                            {isPimpinanJamaah && (
                              <td className="text-xs text-center px-4 py-2 whitespace-nowrap font-semibold border-b">
                                <div
                                  className={`inline-block px-4 py-1 rounded-[30px] ${
                                    sertifikat.status === "disetujui"
                                      ? "bg-[#AFFEB5] text-[#187556]"
                                      : sertifikat.status === "ditolak"
                                      ? "bg-[#FEC5D0] text-[#D80027]"
                                      : "bg-[#FFEFBA] text-[#ffc400]"
                                  }`}
                                >
                                  {sertifikat.status}
                                </div>
                              </td>
                            )}
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {calculateDayDifference(
                                sertifikat.tanggal_pengajuan
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {calculateDayDifference(
                                sertifikat.tanggal_pengajuan
                              )}
                            </td>
                            <td className="py-2 px-4 border-b text-center">
                              <div className="flex justify-center gap-2">
                                <button
                                  onClick={() =>
                                    navigate(
                                      `/log?type=sertifikat&id=${sertifikat.id_sertifikat}`
                                    )
                                  }
                                  className="bg-[#10B981] text-white p-1 rounded-md hover:bg-[#059669]"
                                  title="Riwayat"
                                >
                                  <FaHistory className="text-xs" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleUpdateSertifikat(
                                      sertifikat.id_sertifikat
                                    )
                                  }
                                  className="bg-[#F59E0B] text-white p-1 rounded-md hover:bg-[#D97706]"
                                  title="Update"
                                >
                                  <FaEdit className="text-xs" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteSertifikat(
                                      sertifikat.id_sertifikat
                                    )
                                  }
                                  className="bg-red-500 text-white p-1 rounded-md hover:bg-red-600"
                                  title="Hapus"
                                >
                                  <FaTrash className="text-xs" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={isPimpinanJamaah ? 8 : 7}
                            className="py-4 text-center"
                          >
                            Tidak ada data sertifikat
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>

                  {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            Update Legalitas
                          </h3>

                          {/* Dropdown Jenis Sertifikat */}
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Jenis Sertifikat
                            </label>
                            <select
                              value={selectedJenisSertifikat}
                              onChange={(e) =>
                                setSelectedJenisSertifikat(e.target.value)
                              }
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#187556] focus:border-[#187556] sm:text-sm rounded-md"
                            >
                              <option value="">Pilih Jenis Sertifikat</option>
                              <option value="BASTW">BASTW</option>
                              <option value="AIW">AIW</option>
                              <option value="SW">SW</option>
                            </select>
                          </div>

                          {/* Dropdown Status Pengajuan */}
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Status Pengajuan
                            </label>
                            <select
                              value={selectedStatusPengajuan}
                              onChange={(e) =>
                                setSelectedStatusPengajuan(e.target.value)
                              }
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#187556] focus:border-[#187556] sm:text-sm rounded-md"
                            >
                              <option value="">Pilih Status</option>
                              <option value="Proses">Proses</option>
                              <option value="Terbit">Terbit</option>
                              <option value="Tolak">Ditolak</option>
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
                </div>
              </>
            )}
          </div>
        </div>
        {showDokumenPopup && (
          <PopupListDokumen
            idSertifikat={selectedSertifikatId}
            onClose={() => setShowDokumenPopup(false)}
          />
        )}
      </Sidebar>
    </div>
  );
};

export default EditTanah;
