import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as wellknown from "wellknown";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { Link } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { useNavigate } from "react-router-dom";

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const PetaTanah = ({ tanahId }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [pemetaanData, setPemetaanData] = useState([]);
  const [fasilitasData, setFasilitasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const drawnItemsRef = useRef(null);
  const fasilitasLayerRef = useRef(null);
  const [dataExists, setDataExists] = useState(false);
  const [isAddingFasilitas, setIsAddingFasilitas] = useState(false);
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
  const [fasilitasDetailData, setFasilitasDetailData] = useState({});

  const fetchFasilitasDetailData = async (id_pemetaan_fasilitas) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/fasilitas/pemetaan/${id_pemetaan_fasilitas}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data || null;
    } catch (err) {
      console.error("Error fetching fasilitas detail data:", err);
      return null;
    }
  };

  const wkbToGeoJSON = (geometryData) => {
    try {
      if (typeof geometryData === "object" && geometryData.type) {
        return {
          type: "Feature",
          geometry: geometryData,
          properties: {},
        };
      }

      if (typeof geometryData === "string") {
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
          const wkt = wellknown.parse(geometryData);
          return {
            type: "Feature",
            geometry: wkt,
            properties: {},
          };
        }
      }

      return null;
    } catch (err) {
      console.error("Gagal mengkonversi data geometri ke GeoJSON:", err);
      return null;
    }
  };

  const savePemetaanData = async (geometry, type) => {
    try {
      const token = localStorage.getItem("token");
      let finalType = type === "LINESTRING" ? "POLYGON" : type;
      const geometriJSON = JSON.stringify(geometry);
      const formData = {
        nama_pemetaan: `Pemetaan ${new Date().toLocaleDateString()}`,
        keterangan: `Dibuat pada ${new Date().toLocaleString()}`,
        jenis_geometri: finalType,
        geometri: geometriJSON,
      };

      const response = await axios.post(
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

  const PopupContent = ({ item, onDelete, navigate }) => {
    const [detailData, setDetailData] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
      const checkDetail = async () => {
        const data = await fetchFasilitasDetailData(item.id_pemetaan_fasilitas);
        setDetailData(data);
      };
      checkDetail();
    }, [item.id_pemetaan_fasilitas]);

    const handleDetailAction = () => {
      if (detailData) {
        setShowDetailModal(true);
      } else {
        navigate("/fasilitas/create", {
          state: {
            fasilitas: item,
            tanahId: tanahId,
          },
        });
      }
    };

    const handleAddInventaris = () => {
      navigate("/inventaris/create", {
        state: {
          fasilitas: item,
          tanahId: tanahId,
        },
      });
    };

    return (
      <div className="p-4 min-w-[280px] max-w-[320px] bg-white rounded-lg shadow-md border border-gray-100">
        <div className="mb-4">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 text-lg">
                {item.nama_fasilitas}
              </h3>
              <div className="text-sm text-gray-600 mt-1">
                {item.kategori_fasilitas}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-xs font-bold text-gray-700 mb-1">KETERANGAN</h4>
          <p className="text-sm text-gray-700">
            {item.keterangan || "Tidak ada keterangan tambahan"}
          </p>
        </div>

        <div className="mb-4 flex items-center">
          <div className="bg-gray-100 rounded-full p-1.5 mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          </div>
          <div className="text-sm">
            <span className="font-medium text-gray-600">Jenis Aset :</span>
            <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium">
              {item.jenis_fasilitas || "Tidak tersedia"}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-gray-200 gap-2">
          <button
            onClick={handleDetailAction}
            className="flex items-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md transition-colors text-xs font-medium flex-1 justify-center"
          >
            {detailData ? "Lihat Detail" : "Tambah Detail"}
          </button>

          <button
            onClick={() => {
              if (
                window.confirm(
                  "Apakah Anda yakin ingin menghapus fasilitas ini?"
                )
              ) {
                onDelete(item.id_pemetaan_fasilitas);
              }
            }}
            className="flex items-center px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors text-xs font-medium flex-1 justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3.5 w-3.5 mr-1.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Hapus
          </button>
        </div>
      </div>
    );
  };

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Clear any existing map content
    while (mapRef.current.firstChild) {
      mapRef.current.removeChild(mapRef.current.firstChild);
    }

    // Initialize map with higher zoom level
    const mapInstance = L.map(mapRef.current, {
      zoomControl: true,
      maxZoom: 22,
      minZoom: 10,
    }).setView([-7.0456, 107.5886], 16);

    mapInstanceRef.current = mapInstance;

    // Sumber peta satelit dengan zoom tinggi
    const baseLayers = {
      "MapTiler Satellite": L.tileLayer(
        "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=insgtVNzCo53KJvnDTe0",
        {
          attribution: "© MapTiler",
          maxZoom: 22,
          noWrap: true,
        }
      ),
      "USGS Satellite": L.tileLayer(
        "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "USGS",
          maxZoom: 22,
          noWrap: true,
        }
      ),
      OpenAerialMap: L.tileLayer(
        "https://tiles.openaerialmap.org/5a9f90c42553e6000ce5ad6c/{z}/{x}/{y}.png",
        {
          attribution: "© OpenAerialMap",
          maxZoom: 22,
          noWrap: true,
        }
      ),
    };

    // Tambahkan layer default (MapTiler)
    baseLayers["MapTiler Satellite"].addTo(mapInstance);

    // Tambahkan kontrol layer
    L.control
      .layers(baseLayers, null, { position: "topright" })
      .addTo(mapInstance);

    // Layer untuk label (opsional)
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Labels © Esri",
        maxZoom: 22,
        noWrap: true,
      }
    ).addTo(mapInstance);

    // Layer untuk pemetaan tanah
    const drawnItemsLayer = new L.FeatureGroup();
    mapInstance.addLayer(drawnItemsLayer);
    drawnItemsRef.current = drawnItemsLayer;

    // Layer untuk fasilitas
    const fasilitasLayer = new L.FeatureGroup();
    mapInstance.addLayer(fasilitasLayer);
    fasilitasLayerRef.current = fasilitasLayer;

    // Regular draw control for land mapping
    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItemsLayer,
        poly: {
          allowIntersection: false,
        },
      },
      draw: {
        marker: false,
        circlemarker: false,
        circle: false,
        rectangle: true,
        polygon: {
          allowIntersection: false,
          showArea: true,
        },
        polyline: false,
      },
    });

    mapInstance.addControl(drawControl);

    // Handle draw events
    mapInstance.on(L.Draw.Event.CREATED, function (event) {
      const layer = event.layer;
      const geoJSON = layer.toGeoJSON().geometry;

      if (isAddingFasilitas) {
        // Add to temporary fasilitas layer
        fasilitasLayerRef.current.addLayer(layer);

        // If pemetaanTanahId is not set yet (when using the global button instead of the marker button)
        // and there is at least one land mapping, use the first one's ID
        if (!fasilitasFormData.pemetaanTanahId && pemetaanData.length > 0) {
          setFasilitasFormData((prev) => ({
            ...prev,
            geometri: geoJSON,
            jenis_geometri: "POLYGON",
            pemetaanTanahId: pemetaanData[0].id_pemetaan_tanah,
          }));
        } else {
          // Just update the geometry
          setFasilitasFormData((prev) => ({
            ...prev,
            geometri: geoJSON,
            jenis_geometri: "POLYGON",
          }));
        }

        // Open form modal for facility details
        setShowFasilitasModal(true);
      } else {
        // Regular land mapping
        drawnItemsLayer.addLayer(layer);
        savePemetaanData(geoJSON, "POLYGON");
      }
    });

    // Enable double click zoom
    mapInstance.doubleClickZoom.enable();

    return mapInstance;
  };

  const [sertifikatData, setSertifikatData] = useState([]);

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
      fetchTanahData();
      fetchSertifikatData();
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

                const addFasilitasButton =
                  markerPopupContent.querySelector(".add-fasilitas");
                addFasilitasButton.onclick = () => {
                  setIsAddingFasilitas(true);

                  // Store the pemetaan tanah ID in the form data
                  setFasilitasFormData((prev) => ({
                    ...prev,
                    pemetaanTanahId: item.id_pemetaan_tanah,
                  }));

                  marker.closePopup();

                  // Add draw control specifically for facilities
                  const facilityDrawControl = new L.Control.Draw({
                    edit: {
                      featureGroup: fasilitasLayerRef.current,
                      poly: {
                        allowIntersection: false,
                      },
                    },
                    draw: {
                      marker: false,
                      circlemarker: false,
                      circle: false,
                      rectangle: true,
                      polygon: {
                        allowIntersection: false,
                        showArea: true,
                      },
                      polyline: false,
                    },
                  });

                  // Remove existing controls if any
                  if (mapInstance._toolbars && mapInstance._toolbars.draw) {
                    mapInstance.removeControl(mapInstance._toolbars.draw);
                  }

                  mapInstance.addControl(facilityDrawControl);
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

    // Render fasilitas mappings with different color
    if (fasilitasData.length > 0) {
      fasilitasData.forEach((item) => {
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
                const root = createRoot(popupContent);

                root.render(
                  <PopupContent
                    item={item}
                    onDelete={deleteFasilitas}
                    navigate={navigate}
                  />
                );

                layer.bindPopup(popupContent);
              },
            }).addTo(mapInstance);

            fasilitasLayerRef.current.addLayer(geoJSONLayer);
          } catch (err) {
            console.error("Error displaying facility geometry:", err, item);
          }
        }
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
    if (tanahId) {
      fetchPemetaanData();
    }
  }, [tanahId]);

  // Fetch facilities data after land mapping data is loaded
  useEffect(() => {
    if (pemetaanData.length > 0) {
      fetchFasilitasData();
    }
  }, [pemetaanData]);

  useEffect(() => {
    if (loading || !mapRef.current) return;

    const mapInstance = initializeMap();
    renderMapData(mapInstance);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [loading, pemetaanData, fasilitasData, dataExists]);

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
