import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { getRoleId, getUserName } from "../utils/Auth";
import Swal from "sweetalert2";

const CreateTanah = () => {
  const [pimpinanJamaah, setPimpinanJamaah] = useState("");
  const [namaWakif, setNamaWakif] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [kota, setKota] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [detailLokasi, setDetailLokasi] = useState("");
  const [luasTanah, setLuasTanah] = useState("");
  const [users, setUsers] = useState([]);
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
  const [calculateLuas, setCalculateLuas] = useState(false);
  const navigate = useNavigate();
  const lokasiLengkap = `${
    provinsiList.find((p) => p.id === provinsi)?.name
  }, ${kotaList.find((k) => k.id === kota)?.name}, ${
    kecamatanList.find((k) => k.id === kecamatan)?.name
  }, ${kelurahanList.find((k) => k.id === kelurahan)?.name}, ${detailLokasi}`;

  const roleId = getRoleId();
  const isPimpinanJamaah = roleId === "326f0dde-2851-4e47-ac5a-de6923447317";

  useEffect(() => {
    if (isPimpinanJamaah) {
      setPimpinanJamaah(getUserName() || "");
    }
  }, [isPimpinanJamaah]);

  useEffect(() => {
    if (calculateLuas && panjangTanah && lebarTanah) {
      const luas = parseFloat(panjangTanah) * parseFloat(lebarTanah);
      setLuasTanah(luas.toString());
    }
  }, [panjangTanah, lebarTanah, calculateLuas]);

  useEffect(() => {
    if (isPimpinanJamaah) return;
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Anda harus login untuk melihat data pengguna.");
        return;
      }
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/data/user", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        setUsers(response.data.data || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [isPimpinanJamaah]);

  useEffect(() => {
    const fetchProvinsi = async () => {
      try {
        const response = await axios.get(
          "https://api.binderbyte.com/wilayah/provinsi?api_key=231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d"
        );
        setProvinsiList(response.data.value);
      } catch (error) {
        console.error("Error fetching provinsi:", error);
      }
    };
    fetchProvinsi();
  }, []);

  useEffect(() => {
    if (provinsi) {
      const fetchKota = async () => {
        try {
          const response = await axios.get(
            `https://api.binderbyte.com/wilayah/kabupaten?api_key=231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d&id_provinsi=${provinsi}`
          );
          setKotaList(response.data.value);
        } catch (error) {
          console.error("Error fetching kota:", error);
        }
      };
      fetchKota();
    }
  }, [provinsi]);

  useEffect(() => {
    if (kota) {
      const fetchKecamatan = async () => {
        try {
          const response = await axios.get(
            `https://api.binderbyte.com/wilayah/kecamatan?api_key=231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d&id_kabupaten=${kota}`
          );
          setKecamatanList(response.data.value || []);
        } catch (error) {
          console.error("Error fetching kecamatan:", error);
        }
      };
      fetchKecamatan();
    }
  }, [kota]);

  useEffect(() => {
    if (kecamatan) {
      const fetchKelurahan = async () => {
        try {
          const response = await axios.get(
            `https://api.binderbyte.com/wilayah/kelurahan?api_key=231b062a5d2c75a9f68a41107079fb6bba17c1251089b912ad92d9f572dd974d&id_kecamatan=${kecamatan}`
          );
          setKelurahanList(response.data.value || []);
        } catch (error) {
          console.error("Error fetching kelurahan:", error);
        }
      };
      fetchKelurahan();
    }
  }, [kecamatan]);

  const jenisTanahOptions = [
    { value: "", label: "Pilih Jenis Tanah" },
    { value: "Darat", label: "Darat" },
    { value: "Sawah", label: "Sawah" },
  ];

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login untuk menambahkan data.");
      return;
    }
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/tanah",
        {
          NamaPimpinanJamaah: pimpinanJamaah,
          NamaWakif: namaWakif,
          lokasi: lokasiLengkap,
          luasTanah: luasTanah,
          jenis_tanah: jenisTanah,
          batas_timur: batasTimur,
          batas_selatan: batasSelatan,
          batas_barat: batasBarat,
          batas_utara: batasUtara,
          panjang_tanah: panjangTanah,
          lebar_tanah: lebarTanah,
          catatan: catatan,
          alamat_wakif: alamatWakif,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (isPimpinanJamaah) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Permintaan telah dikirim ke Bidgar Wakaf untuk ditinjau.",
          confirmButtonText: "OK",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil ditambahkan!",
          confirmButtonText: "OK",
        });
      }
      navigate("/sertifikat");
    } catch (error) {
      console.error("Gagal menambahkan data:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat menambahkan data.",
        confirmButtonText: "OK",
      });
    }
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
              <span className="text-[#FECC23]">Tanah</span>{" "}
              <span className="text-[#187556]">Baru</span>
            </h2>
            <p className="text-center text-gray-500">PC Persis Banjaran</p>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Kolom kiri */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Pimpinan Jamaah
                    </label>
                    {isPimpinanJamaah ? (
                      <input
                        type="text"
                        className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left bg-gray-100 rounded-t"
                        value={pimpinanJamaah}
                        disabled
                        required
                      />
                    ) : (
                      <select
                        className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
                        value={pimpinanJamaah}
                        onChange={(e) => setPimpinanJamaah(e.target.value)}
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
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nama Wakif
                    </label>
                    <input
                      type="text"
                      className="w-full border-b-2 border-gray-300 p-2 focus:outline-none focus:border-[#187556] text-left rounded-t"
                      value={namaWakif}
                      onChange={(e) => setNamaWakif(e.target.value)}
                      required
                    />
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
                                parseFloat(luasTanah).toLocaleString("id-ID")
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
                            parseFloat(panjangTanah) * parseFloat(lebarTanah)
                          ).toLocaleString("id-ID")
                        )}
                        m²
                      </p>
                    )}
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

              <div className="mt-6 space-y-6">
                <div className="bg-gray-100 p-4 rounded-md shadow-inner">
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Lokasi Tanah Wakaf:
                  </h3>
                  <p className="text-gray-600">
                    {detailLokasi || "-"}
                    {kelurahan
                      ? `, ${
                          kelurahanList.find((k) => k.id === kelurahan)?.name ||
                          "Belum dipilih"
                        }`
                      : ""}
                    {kecamatan
                      ? `, ${
                          kecamatanList.find((k) => k.id === kecamatan)?.name ||
                          "Belum dipilih"
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
              </div>

              <div className="flex justify-center mt-8">
                <button
                  type="submit"
                  className="bg-[#3B82F6] text-white px-6 py-2 rounded-md hover:bg-[#2563EB]"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      </Sidebar>
    </div>
  );
};

export default CreateTanah;