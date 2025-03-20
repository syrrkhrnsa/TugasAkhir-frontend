import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const EditTanah = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();

  const [NamaPimpinanJamaah, setNamaPimpinanJamaah] = useState("");
  const [NamaWakif, setNamaWakif] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [luasTanah, setLuasTanah] = useState("");
  const [loading, setLoading] = useState(true);
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

  return (
    <div className="relative">
      <Sidebar>
        <div className="flex-1 p-4">
          <div
            className="bg-white shadow-lg rounded-lg p-10 mx-auto w-[60%] max-w-3xl"
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
                      <option value="" disabled>Pilih Provinsi</option>
                      {provinsiList.map((prov) => (
                        <option key={prov.id} value={prov.id}>{prov.name}</option>
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
                          <option value="" disabled>Pilih Kabupaten/Kota</option>
                          {kotaList.map((kab) => (
                            <option key={kab.id} value={kab.id}>{kab.name}</option>
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
                          <option value="" disabled>Pilih Kecamatan</option>
                          {kecamatanList.map((kec) => (
                            <option key={kec.id} value={kec.id}>{kec.name}</option>
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
                          <option value="" disabled>Pilih Kelurahan/Desa</option>
                          {kelurahanList.map((kel) => (
                            <option key={kel.id} value={kel.id}>{kel.name}</option>
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
                  </div>
                </div>
                {/* Input Detail Lokasi */}
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
              {/* Preview Lokasi */}
             
                <div className="bg-gray-100 p-4 rounded-md mt-8 shadow-md">
                  <h3 className="text-lg font-semibold text-gray-700">Preview Lokasi:</h3>
                  <p className="text-gray-600 mt-2">
                    {`${provinsiList.find((p) => p.id === provinsi)?.name}, ${kotaList.find((k) => k.id === kota)?.name}, ${kecamatanList.find((k) => k.id === kecamatan)?.name}, ${kelurahanList.find((k) => k.id === kelurahan)?.name}, ${detailLokasi}`}
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
            )}
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default EditTanah;
