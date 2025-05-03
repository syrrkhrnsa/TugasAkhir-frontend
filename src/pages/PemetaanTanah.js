import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as wellknown from "wellknown";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { Link, useNavigate } from "react-router-dom";

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const PetaTanah = ({ tanahId }) => {
  // Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const drawControlRef = useRef(null);
  const drawnItemsRef = useRef(null);
  const fasilitasLayerRef = useRef(null);
  
  // State
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sertifikatData, setSertifikatData] = useState([]);
  const [pemetaanData, setPemetaanData] = useState([]);
  const [fasilitasData, setFasilitasData] = useState([]);
  const [dataExists, setDataExists] = useState(false);
  const [isAddingFasilitas, setIsAddingFasilitas] = useState(false);
  const [mode, setMode] = useState(null);
  const [selectedPemetaanId, setSelectedPemetaanId] = useState(null);
  const [showFasilitasModal, setShowFasilitasModal] = useState(false);
  const [fasilitasFormData, setFasilitasFormData] = useState({
    jenis_fasilitas: "Tidak Bergerak",
    kategori_fasilitas: "",
    nama_fasilitas: "",
    keterangan: "",
    geometri: null,
    jenis_geometri: "POLYGON",
    pemetaanTanahId: null,
  });

  const navigate = useNavigate();

  // Konfigurasi Map Tiles
  const MAP_TILES = {
    "MapTiler Satellite": {
      url: "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=insgtVNzCo53KJvnDTe0",
      attribution: "© MapTiler",
    },
    "USGS Satellite": {
      url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
      attribution: "USGS",
    },
    "OpenAerialMap": {
      url: "https://tiles.openaerialmap.org/5a9f90c42553e6000ce5ad6c/{z}/{x}/{y}.png",
      attribution: "© OpenAerialMap",
    },
  };

  // Fungsi utama untuk mengambil semua data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      // Pastikan tanahId valid
      if (!tanahId) {
        throw new Error("ID Tanah tidak valid");
      }

      // Fetch data secara paralel
      const [tanahRes, pemetaanRes, sertifikatRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/tanah/${tanahId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://127.0.0.1:8000/api/pemetaan-tanah/${tanahId}`, { // Perhatikan perubahan endpoint
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://127.0.0.1:8000/api/sertifikat/tanah/${tanahId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Set data tanah dan sertifikat
      setTanahData(tanahRes.data.data || {});
      setSertifikatData(sertifikatRes.data.data || []);

      // Proses data pemetaan
      if (pemetaanRes.data.data && pemetaanRes.data.data.length > 0) {
        setDataExists(true);
        const processedData = pemetaanRes.data.data.map(item => ({
          ...item,
          geojson: wkbToGeoJSON(item.geometri)
        }));
        setPemetaanData(processedData);
        
        // Fetch data fasilitas setelah pemetaan selesai
        await fetchFasilitasData(processedData);
      } else {
        setDataExists(false);
        setPemetaanData([]);
        setFasilitasData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.response?.data?.message || err.message || "Gagal memuat data");
      setPemetaanData([]);
      setFasilitasData([]);
    } finally {
      setLoading(false);
    }
  }, [tanahId]);

  const fetchFasilitasData = async () => {
    try {
      const token = localStorage.getItem("token");

      // First, we need to make separate API calls for each pemetaan tanah
      if (pemetaanData && pemetaanData.length > 0) {
        let allFasilitasData = [];

        // Create an array of promises for each pemetaan tanah
        const fetchPromises = pemetaanData.map((pemetaanItem) => {
          return axios
            .get(
              `http://127.0.0.1:8000/api/pemetaan/fasilitas/${pemetaanItem.id_pemetaan_tanah}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            )
            .then((response) => {
              if (response.data.data && response.data.data.length > 0) {
                return response.data.data;
              }
              return [];
            })
            .catch((err) => {
              console.error(
                `Error fetching fasilitas for pemetaan ${pemetaanItem.id_pemetaan_tanah}:`,
                err
              );
              return [];
            });
        });

        // Wait for all API calls to complete
        const results = await Promise.all(fetchPromises);

        // Flatten the array of arrays into a single array
        allFasilitasData = results.flat();

        if (allFasilitasData.length > 0) {
          const dataWithGeoJSON = allFasilitasData.map((item) => {
            if (item.geometri) {
              const geojson = wkbToGeoJSON(item.geometri);
              return { ...item, geojson };
            }
            return item;
          });
          setFasilitasData(dataWithGeoJSON);
        } else {
          setFasilitasData([]);
        }
      } else {
        setFasilitasData([]);
      }
    } catch (err) {
      console.error("Error fetching fasilitas data:", err);
      setFasilitasData([]);
    }
  };

  // Fungsi konversi WKB/WKT ke GeoJSON
  const wkbToGeoJSON = (geometryData) => {
    try {
      if (!geometryData) return null;

      // Jika sudah berupa object GeoJSON
      if (typeof geometryData === 'object' && geometryData.type) {
        return {
          type: "Feature",
          geometry: geometryData,
          properties: {},
        };
      }

      // Jika berupa string JSON
      if (typeof geometryData === 'string') {
        try {
          const parsed = JSON.parse(geometryData);
          if (parsed.type) {
            return {
              type: "Feature",
              geometry: parsed,
              properties: {},
            };
          }
        } catch (e) {
          // Jika bukan JSON, coba parse sebagai WKT
          const wkt = wellknown.parse(geometryData);
          if (wkt) {
            return {
              type: "Feature",
              geometry: wkt,
              properties: {},
            };
          }
        }
      }

      return null;
    } catch (err) {
      console.error("Gagal mengkonversi data geometri:", err);
      return null;
    }
  };

  const savePemetaanData = async (geometry) => {
    try {
      const token = localStorage.getItem("token");
      const formData = {
        nama_pemetaan: `Pemetaan ${new Date().toLocaleDateString()}`,
        keterangan: `Dibuat pada ${new Date().toLocaleString()}`,
        jenis_geometri: "POLYGON",
        geometri: JSON.stringify(geometry),
      };

      await axios.post(
        `http://127.0.0.1:8000/api/pemetaan/tanah/${tanahId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await fetchPemetaanData();
    } catch (err) {
      console.error("Gagal menyimpan data pemetaan:", err);
      alert(
        `Gagal menyimpan data pemetaan: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const saveFasilitasData = async () => {
    try {
      if (!fasilitasFormData.geometri) {
        alert("Data geometri fasilitas tidak valid");
        return;
      }

      if (!fasilitasFormData.pemetaanTanahId) {
        alert("ID pemetaan tanah tidak valid");
        return;
      }

      const token = localStorage.getItem("token");
      const formData = {
        jenis_fasilitas: fasilitasFormData.jenis_fasilitas,
        kategori_fasilitas: fasilitasFormData.kategori_fasilitas,
        nama_fasilitas: fasilitasFormData.nama_fasilitas,
        keterangan: fasilitasFormData.keterangan,
        jenis_geometri: fasilitasFormData.jenis_geometri,
        geometri: JSON.stringify(fasilitasFormData.geometri),
      };

      // Using pemetaanTanahId from form data for the specific land mapping
      const response = await axios.post(
        `http://127.0.0.1:8000/api/pemetaan/fasilitas/${fasilitasFormData.pemetaanTanahId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setShowFasilitasModal(false);
      resetFasilitasForm();
      await fetchFasilitasData();
      setIsAddingFasilitas(false);
    } catch (err) {
      console.error("Gagal menyimpan data fasilitas:", err);
      alert(
        `Gagal menyimpan data fasilitas: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const deletePemetaan = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/pemetaan/tanah/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchPemetaanData();
    } catch (err) {
      console.error("Gagal menghapus data pemetaan:", err);
      alert(
        `Gagal menghapus data pemetaan: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const deleteFasilitas = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://127.0.0.1:8000/api/pemetaan/fasilitas/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchFasilitasData();
    } catch (err) {
      console.error("Gagal menghapus data fasilitas:", err);
      alert(
        `Gagal menghapus data fasilitas: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  const fetchPemetaanData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/pemetaan/tanah/${tanahId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        setDataExists(true);
        const dataWithGeoJSON = response.data.data.map((item) => {
          if (item.geometri) {
            const geojson = wkbToGeoJSON(item.geometri);
            return { ...item, geojson };
          }
          return item;
        });
        setPemetaanData(dataWithGeoJSON);
      } else {
        setDataExists(false);
        setPemetaanData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err.message || "Gagal memuat data pemetaan");
      setPemetaanData([]);
    } finally {
      setLoading(false);
    }
  };

  // Inisialisasi peta
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Clear existing map
    while (mapRef.current.firstChild) {
      mapRef.current.removeChild(mapRef.current.firstChild);
    }

    const mapInstance = L.map(mapRef.current, {
      zoomControl: true,
      maxZoom: 22,
      minZoom: 10,
    }).setView([-7.0456, 107.5886], 16);

    mapInstanceRef.current = mapInstance;

    // Add base layers
    const baseLayers = {};
    Object.entries(MAP_TILES).forEach(([name, config]) => {
      baseLayers[name] = L.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: 22,
        noWrap: true,
      });
    });

    baseLayers["MapTiler Satellite"].addTo(mapInstance);
    L.control.layers(baseLayers, null, { position: "topright" }).addTo(mapInstance);

    // Add labels layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Labels © Esri",
        maxZoom: 22,
        noWrap: true,
      }
    ).addTo(mapInstance);

    // Initialize feature groups
    drawnItemsRef.current = new L.FeatureGroup();
    mapInstance.addLayer(drawnItemsRef.current);

    fasilitasLayerRef.current = new L.FeatureGroup();
    mapInstance.addLayer(fasilitasLayerRef.current);

    // Setup draw control
    setupDrawControl(mapInstance);

    return mapInstance;
  };

  // Setup draw control
  const setupDrawControl = (mapInstance) => {
    if (drawControlRef.current) {
      mapInstance.removeControl(drawControlRef.current);
    }

    const drawOptions = {
      edit: {
        featureGroup: mode === "facility" ? fasilitasLayerRef.current : drawnItemsRef.current,
        poly: { allowIntersection: false },
      },
      draw: {
        marker: false,
        circlemarker: false,
        circle: false,
        polyline: false,
        rectangle: mode !== "facility",
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
      },
    };

    drawControlRef.current = new L.Control.Draw(drawOptions);
    mapInstance.addControl(drawControlRef.current);

    // Handle draw events
    mapInstance.off(L.Draw.Event.CREATED);
    mapInstance.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const geoJSON = layer.toGeoJSON().geometry;

      if (mode === "facility") {
        fasilitasLayerRef.current.addLayer(layer);
        setFasilitasFormData(prev => ({
          ...prev,
          geometri: geoJSON,
          pemetaanTanahId: selectedPemetaanId,
        }));
        setShowFasilitasModal(true);
      } else {
        drawnItemsRef.current.addLayer(layer);
        savePemetaanData(geoJSON);
      }
    });
  };

  const fetchSertifikatData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/sertifikat/tanah/${tanahId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSertifikatData(response.data.data || []);
    } catch (err) {
      console.error("Error fetching sertifikat data:", err);
    }
  };

  useEffect(() => {
    if (tanahId) {
      fetchPemetaanData();
      fetchSertifikatData(); // Tambahkan ini
    }
  }, [tanahId]);

  const [tanahData, setTanahData] = useState({});

  const fetchTanahData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/tanah/${tanahId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTanahData(response.data.data || {});
    } catch (err) {
      console.error("Error fetching tanah data:", err);
    }
  };

  useEffect(() => {
    if (tanahId) {
      const fetchData = async () => {
        await fetchTanahData();
        await fetchSertifikatData();
        await fetchPemetaanData();
      };
      fetchData();
    }
  }, [tanahId]);

  const renderMapData = (mapInstance) => {
    if (!mapInstance) return;

    // Clear existing layers except base tile layer
    if (drawnItemsRef.current) {
      mapInstance.removeLayer(drawnItemsRef.current);
      drawnItemsRef.current = new L.FeatureGroup();
      mapInstance.addLayer(drawnItemsRef.current);
    }

    if (fasilitasLayerRef.current) {
      mapInstance.removeLayer(fasilitasLayerRef.current);
      fasilitasLayerRef.current = new L.FeatureGroup();
      mapInstance.addLayer(fasilitasLayerRef.current);
    }

    // Render land mappings
    if (dataExists && pemetaanData.length > 0) {
      const geoJSONGroup = L.featureGroup();

      pemetaanData.forEach((item) => {
        if (item.geojson && item.geojson.geometry) {
          try {
            const geoJSONLayer = L.geoJSON(item.geojson, {
              style: {
                color: "#ff0000", // Red for land mapping
                weight: 3,
                opacity: 1,
                fillOpacity: 0.3,
              },
              onEachFeature: function (feature, layer) {
                const popupContent = document.createElement("div");
                popupContent.className =
                  "p-4 min-w-[240px] font-sans bg-white rounded-lg shadow-lg";

                popupContent.innerHTML = `
                  <div class="space-y-4">
                    <!-- Header -->
                    <div class="mb-4">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="bg-blue-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800">${
                          item.nama_pemetaan
                        }</h3>
                      </div>
                    </div>
                
                    <!-- Main Info Section -->
                    <div class="bg-gray-50 p-4 rounded-md space-y-3">
                      <!-- Location - Modified with larger icon and smaller text -->
                      <div class="flex items-start text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 mr-3 text-gray-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5.05 3.636a7 7 0 119.9 9.9l-4.243 4.243a1 1 0 01-1.414 0l-4.243-4.243a7 7 0 010-9.9zm4.95 3.364a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd" />
                        </svg>
                        <div>
                          <div class="font-medium text-gray-700">Lokasi:</div>
                          <div class="text-xs text-gray-600 mt-1">${
                            tanahData.lokasi || "Tidak tersedia"
                          }</div>
                        </div>
                      </div>
                
                      <!-- Land Area -->
                      <div class="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span>
                          <span class="font-medium text-gray-700">Luas Tanah:</span> 
                          ${
                            tanahData.luasTanah
                              ? new Intl.NumberFormat("id-ID").format(
                                  tanahData.luasTanah
                                ) + " m²"
                              : "Tidak tersedia"
                          }
                        </span>
                      </div>
                
                      <!-- Wakif Name -->
                      <div class="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.486 0 4.823.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          <span class="font-medium text-gray-700">Nama Wakif:</span> ${
                            tanahData.NamaWakif || "Tidak tersedia"
                          }
                        </span>
                      </div>
                    </div>
                
                    <!-- Legal Documents Section -->
                    <div class="mb-4">
                      <h4 class="font-medium text-sm text-gray-700 mb-2">Legalitas Tanah:</h4>
                      ${
                        sertifikatData.length > 0
                          ? sertifikatData
                              .map(
                                (sertifikat) => `
                          <div class="mb-2 p-2 bg-gray-100 rounded">
                            <div class="flex justify-between items-center">
                              <span class="font-medium text-sm">${
                                sertifikat.jenis_sertifikat || "Tidak diketahui"
                              }</span>
                              <span class="text-xs ${
                                sertifikat.status_pengajuan === "Terbit"
                                  ? "bg-green-100 text-green-800"
                                  : sertifikat.status_pengajuan === "Ditolak"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              } px-2 py-1 rounded-full">
                                ${sertifikat.status_pengajuan || "Proses"}
                              </span>
                            </div>
                            <div class="text-xs text-gray-500 mt-2 space-y-1">
                              <div class="flex items-center">
                                No: ${sertifikat.no_dokumen || "Belum Tersedia"}
                              </div>
                              <div class="flex items-center">
                                Tanggal Pengajuan: ${
                                  sertifikat.tanggal_pengajuan
                                    ? new Date(
                                        sertifikat.tanggal_pengajuan
                                      ).toLocaleDateString()
                                    : "-"
                                }
                              </div>
                            </div>
                          </div>
                        `
                              )
                              .join("")
                          : '<p class="text-sm text-gray-500 italic">Belum ada data legalitas</p>'
                      }
                    </div>

                    <!-- Additional Notes -->
                    <div class="p-3 bg-gray-50 rounded-lg">
                      <p class="text-sm text-gray-700">${
                        item.keterangan || "Tidak ada keterangan tambahan"
                      }</p>
                    </div>
                
                    <!-- Delete button -->
                    <div class="flex justify-end pt-3 border-t border-gray-200">
                      <button class="btn-delete flex items-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </div>
                `;

                const deleteButton = popupContent.querySelector(".btn-delete");
                deleteButton.onclick = () => {
                  if (
                    window.confirm(
                      "Apakah Anda yakin ingin menghapus pemetaan ini?"
                    )
                  ) {
                    deletePemetaan(item.id_pemetaan_tanah);
                  }
                };

                layer.bindPopup(popupContent);

                const bounds = layer.getBounds();
                const center = bounds.getCenter();

                const marker = L.marker(center, {
                  icon: new L.Icon.Default(),
                }).addTo(mapInstance);

                const markerPopupContent = document.createElement("div");
                markerPopupContent.className =
                  "p-3 min-w-[220px] max-w-[260px] bg-white rounded-lg shadow-lg border border-gray-200";
                markerPopupContent.innerHTML = `
                  <div class="mb-4">
                    <!-- Header with map-themed design -->
                    <div class="flex items-center gap-3 pb-2 border-b border-gray-100">
                      <div class="bg-blue-100 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 class="font-bold text-gray-800">Area Pemetaan</h3>
                        <p class="text-xs text-gray-500 mt-1">${item.nama_pemetaan}</p>
                      </div>
                    </div>
                  </div>
                
                  <!-- Action buttons with improved styling -->
                  <div class="space-y-2">
                    <button class="zoom-to-location w-full flex items-center justify-between px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors border border-blue-100">
                      <span class="text-sm">Navigasi ke Lokasi</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    
                    <button class="add-fasilitas w-full flex items-center justify-between px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors border border-green-100">
                      <span class="text-sm">Buat Pemetaan Fasilitas</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    
                    <button class="btn-delete-marker w-full flex items-center justify-between px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors border border-red-100">
                      <span class="text-sm">Hapus Area Ini</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                `;

                const zoomButton =
                  markerPopupContent.querySelector(".zoom-to-location");
                zoomButton.onclick = () => {
                  mapInstance.fitBounds(bounds, { padding: [50, 50] });
                  marker.closePopup();
                };

                const deleteMarkerButton =
                  markerPopupContent.querySelector(".btn-delete-marker");
                deleteMarkerButton.onclick = () => {
                  if (
                    window.confirm(
                      "Apakah Anda yakin ingin menghapus pemetaan ini?"
                    )
                  ) {
                    deletePemetaan(item.id_pemetaan_tanah);
                  }
                };

                const addFasilitasButton = markerPopupContent.querySelector(".add-fasilitas");
                addFasilitasButton.onclick = () => {
                  setMode('facility');
                  setSelectedPemetaanId(item.id_pemetaan_tanah);
                  setupDrawControl(mapInstance);
                  marker.closePopup();
                };
                marker.bindPopup(markerPopupContent);
              },
            }).addTo(mapInstance);

            drawnItemsRef.current.addLayer(geoJSONLayer);
            geoJSONGroup.addLayer(geoJSONLayer);
          } catch (err) {
            console.error("Error displaying geometry:", err, item);
          }
        }
      });

      if (geoJSONGroup.getLayers().length > 0) {
        mapInstance.fitBounds(geoJSONGroup.getBounds(), { padding: [50, 50] });
      }
    } else {
      const noDataNotice = L.control({ position: "topright" });
      noDataNotice.onAdd = function () {
        const div = L.DomUtil.create("div", "no-data-notice");
        div.innerHTML = `
          <div class="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p class="font-bold">Belum ada data pemetaan</p>
            <p>Gunakan alat menggambar untuk membuat pemetaan</p>
          </div>
        `;
        return div;
      };
      noDataNotice.addTo(mapInstance);
    }

    const showDetailModal = (detailData, fasilitasData) => {
      const modal = document.createElement("div");
      modal.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";
      
      modal.innerHTML = `
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div class="p-8">
            <!-- Header with close button -->
            <div class="flex justify-between items-start mb-6">
              <div>
                <h3 class="text-2xl font-bold text-gray-800">Detail Fasilitas</h3>
              </div>
              <button class="btn-close-modal p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <!-- Main Content -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Fasilitas Info Card -->
              <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-blue-100 p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h4 class="text-lg font-semibold text-gray-800">Informasi Fasilitas</h4>
                </div>
                
                <div class="space-y-4">
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</p>
                      <p class="font-medium mt-1">${fasilitasData.nama_fasilitas}</p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</p>
                      <p class="font-medium mt-1">${fasilitasData.kategori_fasilitas}</p>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Aset</p>
                      <p class="font-medium mt-1">
                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          fasilitasData.jenis_fasilitas === 'Bergerak' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }">
                          ${fasilitasData.jenis_fasilitas}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</p>
                    <p class="text-gray-700 mt-1">${fasilitasData.keterangan || "Tidak ada keterangan"}</p>
                  </div>
                  
                  <!-- Facility Images Section -->
                  <div>
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar Fasilitas</p>
                    <div class="mt-2 grid grid-cols-3 gap-2">
                      ${detailData.file_gambar ? `
                        <div class="relative group aspect-square">
                          <img src="http://127.0.0.1:8000/storage/${detailData.file_gambar}" 
                               alt="Gambar Fasilitas" 
                               class="w-full h-full object-cover rounded-lg border border-gray-200">
                          <a href="http://127.0.0.1:8000/storage/${detailData.file_gambar}" 
                             target="_blank" 
                             class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg">
                            <span class="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-2 py-1 rounded-full text-xs flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Lihat
                            </span>
                          </a>
                        </div>
                      ` : `
                        <div class="aspect-square bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      `}
                      ${detailData.file_gambar2 ? `
                        <div class="relative group aspect-square">
                          <img src="http://127.0.0.1:8000/storage/${detailData.file_gambar2}" 
                               alt="Gambar Fasilitas 2" 
                               class="w-full h-full object-cover rounded-lg border border-gray-200">
                          <a href="http://127.0.0.1:8000/storage/${detailData.file_gambar2}" 
                             target="_blank" 
                             class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg">
                            <span class="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-2 py-1 rounded-full text-xs flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Lihat
                            </span>
                          </a>
                        </div>
                      ` : `
                        <div class="aspect-square bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      `}
                      ${detailData.file_gambar3 ? `
                        <div class="relative group aspect-square">
                          <img src="http://127.0.0.1:8000/storage/${detailData.file_gambar3}" 
                               alt="Gambar Fasilitas 3" 
                               class="w-full h-full object-cover rounded-lg border border-gray-200">
                          <a href="http://127.0.0.1:8000/storage/${detailData.file_gambar3}" 
                             target="_blank" 
                             class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg">
                            <span class="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-2 py-1 rounded-full text-xs flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Lihat
                            </span>
                          </a>
                        </div>
                      ` : `
                        <div class="aspect-square bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      `}
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Detail Info Card -->
              <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div class="flex items-center gap-3 mb-4">
                  <div class="bg-purple-100 p-3 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 class="text-lg font-semibold text-gray-800">Detail Tambahan</h4>
                </div>
                
                <div class="space-y-4">
                  <div>
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</p>
                    <div class="mt-1 p-3 bg-white rounded border border-gray-200">
                      <p class="text-gray-700">${detailData.catatan || "Tidak ada catatan"}</p>
                    </div>
                  </div>
                  
                  <!-- 360° View Button -->
                  <div>
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">View 360°</p>
                    ${detailData.file_360 ? `
                      <div class="mt-2">
                        <button class="btn-view-360 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                          </svg>
                          Buka View 360°
                        </button>
                      </div>
                    ` : `
                      <div class="mt-2 p-4 bg-gray-100 rounded-lg border border-dashed border-gray-300 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        <p class="mt-2 text-sm text-gray-500">View 360° tidak tersedia</p>
                      </div>
                    `}
                  </div>
                  
                  <!-- PDF Preview Section -->
                  <div>
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen PDF</p>
                    ${detailData.file_pdf ? `
                      <div>
                        <a href="http://127.0.0.1:8000/storage/${detailData.file_pdf}" 
                           target="_blank" 
                           class="inline-flex items-center mt-1 text-blue-600 hover:text-blue-800">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Lihat Dokumen
                        </a>
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Action Buttons -->
            <div class="mt-8 flex justify-end space-x-3 border-t pt-6">
              <button class="btn-close-modal px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
                Tutup
              </button>
              <button class="btn-view-inventaris px-5 py-2.5 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Lihat Inventaris
              </button>
              <button class="btn-edit-detail px-5 py-2.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Detail
              </button>
            </div>
          </div>
        </div>
      `;
    
      document.body.appendChild(modal);

        // Handle tombol Lihat Inventaris
        const viewInventarisButton = modal.querySelector(".btn-view-inventaris");
        viewInventarisButton.addEventListener("click", () => {
          // Pastikan detailData memiliki id_fasilitas
          if (!detailData || typeof detailData.id_fasilitas === 'undefined') {
            console.error("Cannot view inventory: detailData is missing or invalid");
            alert("Data fasilitas tidak valid. Tidak dapat melihat inventaris.");
            return;
          }
          
          document.body.removeChild(modal);
          navigate(`/inventaris/fasilitas/${detailData.id_fasilitas}`, {
            state: {
              fasilitasData: fasilitasData || {},
              detailData: detailData || {}
            }
          });
        });
    
      // Handle edit button
      const editButton = modal.querySelector(".btn-edit-detail");
      editButton.addEventListener("click", () => {
        // Check if detailData exists and has id_fasilitas
        if (!detailData || typeof detailData.id_fasilitas === 'undefined') {
          console.error("Cannot edit: detailData is missing or invalid");
          // Optionally show an error message to the user
          alert("Data fasilitas tidak valid. Tidak dapat melanjutkan edit.");
          return;
        }
      
        document.body.removeChild(modal);
        navigate(`/fasilitas/edit/${detailData.id_fasilitas}`, {
          state: {
            pemetaanFasilitasData: fasilitasData || [],
            tanahData: tanahData || [],
            detailData: detailData || {}
          }
        });
      });
    
      // Handle 360° view button if exists
      if (detailData.file_360) {
        const view360Button = modal.querySelector(".btn-view-360");
        view360Button.addEventListener("click", () => {
          window.open(`http://127.0.0.1:8000/storage/${detailData.file_360}`, '_blank');
        });
      }
    
      // Handle close buttons
      const closeButtons = modal.querySelectorAll(".btn-close-modal");
      closeButtons.forEach(btn => {
        btn.addEventListener("click", () => {
          document.body.removeChild(modal);
        });
      });
    };

// Render fasilitas mappings with different color
if (fasilitasData.length > 0) {
  // Pertama, fetch semua detail fasilitas sekaligus
  const fetchAllFacilityDetails = async () => {
    const token = localStorage.getItem("token");
    const detailsPromises = fasilitasData.map(async (item) => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/fasilitas/pemetaan/${item.id_pemetaan_fasilitas}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        return {
          ...item,
          hasDetail: response.data.data && response.data.data.length > 0,
          detailData: response.data.data?.[0] || null
        };
      } catch (err) {
        console.error("Error fetching facility details:", err);
        return {
          ...item,
          hasDetail: false,
          detailData: null
        };
      }
    });
    
    return Promise.all(detailsPromises);
  };

  // Kemudian render semua fasilitas setelah data lengkap
  fetchAllFacilityDetails().then(enrichedFacilities => {
    enrichedFacilities.forEach(item => {
      if (item.geojson && item.geojson.geometry) {
        try {
          const geoJSONLayer = L.geoJSON(item.geojson, {
            style: {
              color: "#0066ff",
              weight: 3,
              opacity: 1,
              fillOpacity: 0.3,
            },
            onEachFeature: function (feature, layer) {
              const popupContent = document.createElement("div");
              popupContent.className = "p-4 min-w-[280px] max-w-[320px] bg-white rounded-lg shadow-md border border-gray-100";
              
              // Button action berdasarkan apakah sudah ada detail atau belum
              const actionButton = item.hasDetail 
                ? `
                  <button class="btn-view-detail flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors text-xs font-medium flex-1 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Lihat Detail
                  </button>
                `
                : `
                  <a href="/fasilitas/create/${item.id_pemetaan_fasilitas}" class="flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors text-xs font-medium flex-1 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Detail
                  </a>
                `;

              popupContent.innerHTML = `
                <div class="mb-4">
                  <div class="flex items-start gap-3">
                    <div class="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-bold text-gray-800 text-lg">${item.nama_fasilitas}</h3>
                      <div class="text-sm text-gray-600 mt-1">${item.kategori_fasilitas}</div>
                    </div>
                  </div>
                </div>
                
                <div class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 class="text-xs font-bold text-gray-700 mb-1">KETERANGAN</h4>
                  <p class="text-sm text-gray-700">${item.keterangan || "Tidak ada keterangan tambahan"}</p>
                </div>
              
                <div class="mb-4 flex items-center">
                  <div class="bg-gray-100 rounded-full p-1.5 mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  </div>
                  <div class="text-sm">
                    <span class="font-medium text-gray-600">Jenis Aset :</span>
                    <span class="ml-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
                      ${item.jenis_fasilitas || "Tidak tersedia"}
                    </span>
                  </div>
                </div>
              
                <div class="flex justify-between items-center pt-3 border-t border-gray-200 gap-2">
                  ${actionButton}
                  <button class="btn-delete-fasilitas flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors text-xs font-medium flex-1 justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              `;

              const deleteButton = popupContent.querySelector(".btn-delete-fasilitas");
              deleteButton.onclick = () => {
                if (window.confirm("Apakah Anda yakin ingin menghapus fasilitas ini?")) {
                  deleteFasilitas(item.id_pemetaan_fasilitas);
                }
              };

              if (item.hasDetail) {
                const viewDetailButton = popupContent.querySelector(".btn-view-detail");
                viewDetailButton.onclick = () => {
                  // Tampilkan modal dengan detail fasilitas
                  showDetailModal(item.detailData, item);
                };
              }

              layer.bindPopup(popupContent);
            },
          });

          fasilitasLayerRef.current.addLayer(geoJSONLayer);
          mapInstance.addLayer(geoJSONLayer);
        } catch (err) {
          console.error("Error displaying facility geometry:", err, item);
        }
      }
    });
  });
}
  };

  const resetFasilitasForm = () => {
    setFasilitasFormData({
      jenis_fasilitas: "Tidak Bergerak",
      kategori_fasilitas: "",
      nama_fasilitas: "",
      keterangan: "",
      geometri: null,
      jenis_geometri: "POLYGON",
      pemetaanTanahId: null,
    });
  };

  const handleFasilitasInputChange = (e) => {
    const { name, value } = e.target;
    setFasilitasFormData({
      ...fasilitasFormData,
      [name]: value,
    });
  };

  useEffect(() => {
    if (mapInstanceRef.current && mode) {
      setupDrawControl(mapInstanceRef.current);
    }
  }, [mode, selectedPemetaanId]);

  // Fetch facilities data after land mapping data is loaded
  useEffect(() => {
    if (pemetaanData.length > 0) {
      fetchFasilitasData();
    }
  }, [pemetaanData]);

  useEffect(() => {
    if (loading || !mapRef.current || mapInstanceRef.current) return;
  
    const mapInstance = initializeMap();
    renderMapData(mapInstance);
  
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading]); // Hanya tergantung pada loading

  return (
    <div className="relative">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      <div
        ref={mapRef}
        style={{ height: "700px", width: "100%" }}
        className="z-0 border border-gray-300 rounded-lg"
      />

      {/* Modal for facility data input */}
      {showFasilitasModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Data Fasilitas/Aset</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Jenis Fasilitas:
              </label>
              <div className="flex items-center space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="jenis_fasilitas"
                    value="Tidak Bergerak"
                    checked={
                      fasilitasFormData.jenis_fasilitas === "Tidak Bergerak"
                    }
                    onChange={handleFasilitasInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Tidak Bergerak</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="jenis_fasilitas"
                    value="Bergerak"
                    checked={fasilitasFormData.jenis_fasilitas === "Bergerak"}
                    onChange={handleFasilitasInputChange}
                    className="form-radio h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Bergerak</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Kategori Fasilitas:
              </label>
              <select
                name="kategori_fasilitas"
                value={fasilitasFormData.kategori_fasilitas}
                onChange={handleFasilitasInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Pilih Kategori Fasilitas</option>
                <option value="MASJID">Masjid</option>
                <option value="SEKOLAH">Sekolah</option>
                <option value="PEMAKAMAN">Pemakaman</option>
                <option value="RUMAH">Rumah</option>
                <option value="KANTOR">Kantor</option>
                <option value="GEDUNG">Gedung</option>
                <option value="LAINNYA">Lainnya</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Nama Fasilitas:
              </label>
              <input
                type="text"
                name="nama_fasilitas"
                value={fasilitasFormData.nama_fasilitas}
                onChange={handleFasilitasInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Nama fasilitas"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Keterangan:
              </label>
              <textarea
                name="keterangan"
                value={fasilitasFormData.keterangan}
                onChange={handleFasilitasInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Keterangan (opsional)"
                rows="3"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFasilitasModal(false);
                  resetFasilitasForm();

                  // Clear drawn shapes
                  if (fasilitasLayerRef.current) {
                    fasilitasLayerRef.current.clearLayers();
                  }
                }}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Batal
              </button>
              <button
                onClick={saveFasilitasData}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator when adding fasilitas */}
      {isAddingFasilitas && (
        <div className="absolute top-2 right-2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow-sm">
          <p className="font-bold">Mode Pemetaan Fasilitas Aktif</p>
          <p className="text-sm">Gambar polygon untuk area fasilitas</p>
          <button
            onClick={() => setIsAddingFasilitas(false)}
            className="mt-1 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-2 border border-gray-400 rounded shadow text-xs"
          >
            Batalkan
          </button>
        </div>
      )}
    </div>
  );
};

export default PetaTanah;
