import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as wellknown from "wellknown";
import { Link, useNavigate, useLocation } from "react-router-dom";
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';

// Fix leaflet marker icon path
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const PublicPetaTanah = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [pemetaanData, setPemetaanData] = useState([]);
  const [fasilitasData, setFasilitasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const drawnItemsRef = useRef(null);
  const fasilitasLayerRef = useRef(null);
  const [tanahData, setTanahData] = useState({});
  const [sertifikatData, setSertifikatData] = useState({});
  const [detailFasilitas, setDetailFasilitas] = useState(null);
  const sidebarRef = useRef(null);

  const location = useLocation();

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
      console.error("Konversi geometri gagal:", err);
      return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  const getConditionBadge = (kondisi) => {
    switch (kondisi) {
      case "baik":
        return "bg-green-100 text-green-800";
      case "rusak_ringan":
        return "bg-yellow-100 text-yellow-800";
      case "rusak_berat":
        return "bg-orange-100 text-orange-800";
      case "hilang":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getConditionLabel = (kondisi) => {
    switch (kondisi) {
      case "baik":
        return "Baik";
      case "rusak_ringan":
        return "Rusak Ringan";
      case "rusak_berat":
        return "Rusak Berat";
      case "hilang":
        return "Hilang";
      default:
        return kondisi;
    }
  };

const fetchData = async () => {
  try {
    setLoading(true);

    const [
      pemetaanRes,
      fasilitasRes,
      tanahRes,
      sertifikatRes,
      fasilitasDetailRes,
    ] = await Promise.all([
      axios.get("http://127.0.0.1:8000/api/pemetaan/public"),
      axios.get("http://127.0.0.1:8000/api/fasilitas/public"),
      axios.get("http://127.0.0.1:8000/api/tanah/public"),
      axios.get("http://127.0.0.1:8000/api/sertifikat/public"),
      axios.get("http://127.0.0.1:8000/api/fasilitas/detail/public"),
    ]);

    // Process pemetaan data
    const pemetaan = (pemetaanRes.data.data || []).map((item) => ({
      ...item,
      geojson: item.geometri ? wkbToGeoJSON(item.geometri) : null,
    }));
    setPemetaanData(pemetaan);

    // Process tanah data
    const tanahData = {};
    (tanahRes.data.data || []).forEach((tanah) => {
      tanahData[tanah.id_tanah] = tanah;
    });
    setTanahData(tanahData);

    // Process sertifikat data
    const sertifikatData = {};
    (sertifikatRes.data.data || []).forEach((sertifikat) => {
      if (!sertifikatData[sertifikat.id_tanah]) {
        sertifikatData[sertifikat.id_tanah] = [];
      }
      sertifikatData[sertifikat.id_tanah].push(sertifikat);
    });
    setSertifikatData(sertifikatData);

    // Process fasilitas data
    const fasilitas = (fasilitasRes.data.data || []).map((item) => ({
      ...item,
      geojson: item.geometri ? wkbToGeoJSON(item.geometri) : null,
    }));

    // Process fasilitas details and get inventaris data
    const fasilitasDetails = {};
    const inventarisData = {};

    // Group fasilitas details by id_pemetaan_fasilitas
    (fasilitasDetailRes.data.data || []).forEach((detail) => {
      fasilitasDetails[detail.id_pemetaan_fasilitas] = detail;
    });

    // Fetch inventaris and files for each fasilitas
    const promises = Object.values(fasilitasDetails).map(async (detail) => {
      const [inventarisRes, filesRes] = await Promise.all([
        axios.get(
          `http://127.0.0.1:8000/api/inventaris/fasilitas/${detail.id_fasilitas}/public`
        ),
        axios.get(
          `http://127.0.0.1:8000/api/fasilitas/files/${detail.id_fasilitas}`
        )
      ]);
      
      return {
        id_fasilitas: detail.id_fasilitas,
        inventaris: inventarisRes.data.data || [],
        files: filesRes.data.data || []
      };
    });

    const results = await Promise.all(promises);
    
    results.forEach(result => {
      inventarisData[result.id_fasilitas] = result.inventaris;
      // You might want to add files data here if needed
    });

    // Combine fasilitas with their details, inventaris and files
    const combinedFasilitas = fasilitas.map((item) => {
      const detail = fasilitasDetails[item.id_pemetaan_fasilitas] || null;
      return {
        ...item,
        detail,
        inventaris: detail ? inventarisData[detail.id_fasilitas] || [] : [],
        filePendukung: detail ? results.find(r => r.id_fasilitas === detail.id_fasilitas)?.files || [] : []
      };
    });

    setFasilitasData(combinedFasilitas);
  } catch (err) {
    console.error("Gagal ambil data:", err);
    setError("Gagal memuat data pemetaan. Silakan coba lagi nanti.");
  } finally {
    setLoading(false);
  }
};

  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      zoomControl: false,
      maxZoom: 22,
      minZoom: 10,
    }).setView([-7.0456, 107.5886], 16);
    mapInstanceRef.current = map;

    // Base layers
    const baseLayers = {
      "Google Satelit": L.tileLayer(
        "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
          attribution: "Google Satelit",
          maxZoom: 22,
          noWrap: true,
        }
      ),
      OpenStreetMap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 19,
        }
      ),
    };

    baseLayers["Google Satelit"].addTo(map);
    L.control.layers(baseLayers, null, { position: "topright" }).addTo(map);

    // Add labels layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Labels © Esri",
        maxZoom: 22,
        noWrap: true,
      }
    ).addTo(map);

    drawnItemsRef.current = new L.FeatureGroup().addTo(map);
    fasilitasLayerRef.current = new L.FeatureGroup().addTo(map);

    const zoomControl = L.control.zoom({
      position: "topright",
    });
    zoomControl.addTo(map);

    const geocoder = L.Control.Geocoder.nominatim();
    
    if (URLSearchParams && location.search) {
      const params = new URLSearchParams(location.search);
      const query = params.get('q');
      if (query) {
        geocoder.geocode(query, function(results) {
          if (results.length > 0) {
            map.fitBounds(results[0].bbox);
          }
        });
      }
    }

    L.Control.geocoder({
      defaultMarkGeocode: false,
      position: 'topright',
      placeholder: 'Cari lokasi...',
      errorMessage: 'Lokasi tidak ditemukan',
      geocoder: geocoder
    })
    .on('markgeocode', function(e) {
      const bbox = e.geocode.bbox;
      map.fitBounds(bbox, { padding: [50, 50] });
    })
    .addTo(map);
  };

  const renderMapData = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    drawnItemsRef.current.clearLayers();
    fasilitasLayerRef.current.clearLayers();

    const geoJSONGroup = L.featureGroup();

    // Render land mappings
    pemetaanData.forEach((item) => {
      if (item.geojson && item.geojson.geometry) {
        try {
          // Get related tanah and sertifikat data for this pemetaan
          const relatedTanah = tanahData[item.id_tanah] || {};
          const relatedSertifikat = sertifikatData[item.id_tanah] || [];

          // Prepare comparison info if both luasTanah and luas_tanah exist
          const comparisonInfo =
            relatedTanah.luasTanah && item.luas_tanah
              ? `
                  <div class="mt-3 p-3 bg-gray-50 rounded-md space-y-3">
                      <h4 class="font-medium text-sm text-blue-800 mb-1">Perbandingan Luas:</h4>
                      <div class="grid grid-cols-2 gap-2 text-xs">
                          <div class="bg-white p-2 rounded">
                              <div class="font-medium">Asli</div>
                              <div>${new Intl.NumberFormat("id-ID").format(relatedTanah.luasTanah)} m²</div>
                          </div>
                          <div class="bg-white p-2 rounded">
                              <div class="font-medium">Pemetaan</div>
                              <div>${new Intl.NumberFormat("id-ID").format(item.luas_tanah)} m²</div>
                          </div>
                          <div class="col-span-2 bg-white p-2 rounded">
                              <div class="font-medium">Selisih</div>
                              <div>${new Intl.NumberFormat("id-ID").format(
                                Math.abs(relatedTanah.luasTanah - item.luas_tanah)
                              )} m²</div>
                          </div>
                      </div>
                  </div>
              `
              : "";

          const geoJSONLayer = L.geoJSON(item.geojson, {
            style: {
              color: "#ff0000",
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
                  <div class="mb-4">
                    <div class="flex items-center gap-3 mb-2">
                      <div class="bg-blue-100 p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <h3 class="text-lg font-semibold text-gray-800">${
                        item.nama_pemetaan || "Pemetaan Tanah"
                      }</h3>
                    </div>
                  </div>
              
                  <div class="bg-gray-50 p-4 rounded-md space-y-3">
                    <div class="flex items-start text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 mr-3 text-gray-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 3.636a7 7 0 119.9 9.9l-4.243 4.243a1 1 0 01-1.414 0l-4.243-4.243a7 7 0 010-9.9zm4.95 3.364a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd" />
                      </svg>
                      <div>
                        <div class="font-medium text-gray-700">Lokasi:</div>
                        <div class="text-xs text-gray-600 mt-1">${
                          relatedTanah.lokasi || "Tidak tersedia"
                        }</div>
                      </div>
                    </div>
              
                    <div class="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>
                        <span class="font-medium text-gray-700">Luas Tanah:</span> 
                        ${
                          relatedTanah.luasTanah
                            ? new Intl.NumberFormat("id-ID").format(
                                relatedTanah.luasTanah
                              ) + " m²"
                            : "Tidak tersedia"
                        }
                      </span>
                    </div>
              
                    <div class="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.486 0 4.823.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        <span class="font-medium text-gray-700">Nama Wakif:</span> ${
                          relatedTanah.NamaWakif || "Tidak tersedia"
                        }
                      </span>
                    </div>
                  </div>
                  
                  ${comparisonInfo}
              
                  <div class="mb-4">
                    <h4 class="font-medium text-sm text-gray-700 mb-2">Legalitas Tanah:</h4>
                    ${
                      relatedSertifikat.length > 0
                        ? relatedSertifikat
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

                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-700">${
                      item.keterangan || "Tidak ada keterangan tambahan"
                    }</p>
                  </div>
                </div>
              `;

              layer.bindPopup(popupContent);

              const bounds = layer.getBounds();
              const center = bounds.getCenter();

              const marker = L.marker(center, {
                icon: new L.Icon.Default(),
              }).addTo(map);

              const markerPopupContent = document.createElement("div");
              markerPopupContent.className =
                "p-3 min-w-[220px] max-w-[260px] bg-white rounded-lg shadow-lg border border-gray-200";
              markerPopupContent.innerHTML = `
                <div class="mb-4">
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
              
                <div class="space-y-2">
                  <button class="zoom-to-location w-full flex items-center justify-between px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors border border-blue-100">
                    <span class="text-sm">Navigasi ke Lokasi</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                </div>
              `;

              const zoomButton =
                markerPopupContent.querySelector(".zoom-to-location");
              zoomButton.onclick = () => {
                map.fitBounds(bounds, { padding: [50, 50] });
                marker.closePopup();
              };

              marker.bindPopup(markerPopupContent);
            },
          }).addTo(drawnItemsRef.current);

          geoJSONGroup.addLayer(geoJSONLayer);
        } catch (err) {
          console.error("Error displaying land geometry:", err, item);
        }
      }
    });

    // Render facilities with info
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
              popupContent.className =
                "p-4 min-w-[280px] max-w-[320px] bg-white rounded-lg shadow-md border border-gray-100";
              popupContent.innerHTML = `
                <div class="mb-4">
                  <div class="flex items-start gap-3">
                    <div class="bg-blue-100 p-2.5 rounded-lg flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 class="font-bold text-gray-800 text-lg">${
                        item.nama_fasilitas
                      }</h3>
                      <div class="text-sm text-gray-600 mt-1">${
                        item.kategori_fasilitas
                      }</div>
                    </div>
                  </div>
                </div>
                
                <div class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 class="text-xs font-bold text-gray-700 mb-1">KETERANGAN</h4>
                  <p class="text-sm text-gray-700">${
                    item.keterangan || "Tidak ada keterangan tambahan"
                  }</p>
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

                <button class="lihat-detail-btn w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lihat Detail Fasilitas
                </button>
              `;

              const detailBtn = popupContent.querySelector(".lihat-detail-btn");
              detailBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailFasilitas(item);
                if (layer.closePopup) layer.closePopup();
              };

              layer.bindPopup(popupContent);
            },
          }).addTo(fasilitasLayerRef.current);

          geoJSONGroup.addLayer(geoJSONLayer);
        } catch (err) {
          console.error("Error displaying facility geometry:", err, item);
        }
      }
    });

    if (geoJSONGroup.getLayers().length > 0) {
      map.fitBounds(geoJSONGroup.getBounds(), { padding: [50, 50] });
    }
  };

  useEffect(() => {
    initializeMap();
    fetchData();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      renderMapData();
    }
  }, [loading, pemetaanData, fasilitasData, tanahData, sertifikatData]);

  return (
    <div className="relative w-full h-screen">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-50 p-4 text-sm text-red-700 bg-red-100 rounded-lg shadow-md">
          {error}
        </div>
      )}
      {loading && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p className="text-lg font-semibold">Memuat peta...</p>
          </div>
        </div>
      )}

      {/* Floating Sidebar */}
      <div
        ref={sidebarRef}
        className={`absolute top-4 left-4 z-[1000] w-96 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 ease-in-out ${
          detailFasilitas
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-full"
        }`}
        style={{
          height: "calc(100vh - 2rem)",
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {detailFasilitas && (
          <div className="flex flex-col h-full">
            {/* Header - Fixed */}
            <div className="sticky top-0 z-10 bg-white p-4 border-b border-gray-200 rounded-t-lg flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                Detail Fasilitas
              </h2>
              <button
                onClick={() => setDetailFasilitas(null)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-800">
                      {detailFasilitas.nama_fasilitas}
                    </h1>
                    <p className="text-blue-600 text-sm font-medium">
                      {detailFasilitas.kategori_fasilitas}
                    </p>
                  </div>
                </div>

                {/* Information Card */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wider">
                    Informasi Fasilitas
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Jenis Fasilitas
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {detailFasilitas.jenis_fasilitas || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Tanggal Dibuat
                      </p>
                      <p className="text-sm text-gray-700">
                        {formatDate(detailFasilitas.created_at) || "-"}
                      </p>
                    </div>

                    {detailFasilitas.detail && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Catatan</p>
                        <p className="text-sm text-gray-700">
                          {detailFasilitas.detail.catatan ||
                            "Tidak ada catatan tambahan"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Section */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wider">
                    Gambar Fasilitas
                  </h3>
                  {detailFasilitas.filePendukung && detailFasilitas.filePendukung.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {detailFasilitas.filePendukung
                        .filter(file => file.jenis_file === 'gambar')
                        .map((file, index) => (
                          <a
                            key={index}
                            href={`http://127.0.0.1:8000/api/fasilitas/files/${file.id_file_pendukung}/view`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-gray-200 rounded-md aspect-square flex items-center justify-center overflow-hidden"
                          >
                            <img
                              src={`http://127.0.0.1:8000/api/fasilitas/files/${file.id_file_pendukung}/view`}
                              alt={`Gambar fasilitas ${index + 1}`}
                              className="object-cover w-full h-full"
                            />
                          </a>
                        ))}
                    </div>
                  ) : (
                    <div className="bg-gray-200 rounded-md aspect-square flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}
                  {(!detailFasilitas.filePendukung || detailFasilitas.filePendukung.length === 0) && (
                    <p className="text-xs text-gray-500 mt-2">
                      Belum ada gambar fasilitas
                    </p>
                  )}
                </div>

                {/* Documents Section */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wider">
                    Dokumen
                  </h3>
                  <div className="space-y-2">
                    {/* PDF Documents */}
                    {detailFasilitas.filePendukung && 
                    detailFasilitas.filePendukung.some(file => file.jenis_file === 'dokumen') ? (
                      detailFasilitas.filePendukung
                        .filter(file => file.jenis_file === 'dokumen')
                        .map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="flex items-center">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-500 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                                />
                              </svg>
                              <span className="text-sm truncate max-w-[180px]">
                                {file.nama_asli}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              <a
                                href={`http://127.0.0.1:8000/api/fasilitas/files/${file.id_file_pendukung}/view`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-sm hover:underline"
                              >
                                Lihat
                              </a>
                              <a
                                href={`http://127.0.0.1:8000/api/fasilitas/files/${file.id_file_pendukung}/view`}
                                download={file.nama_asli}
                                className="text-gray-600 text-sm hover:underline"
                              >
                                Unduh
                              </a>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-200">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mx-auto text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                          />
                        </svg>
                        <p className="mt-1 text-sm text-gray-500">
                          Tidak ada dokumen tersedia
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                                {/* 360° View Section - simplified version */}
                                <div className="mt-4">
                                  <h3 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wider">
                                    Tampilan 360°
                                  </h3>
                                  {detailFasilitas.filePendukung && 
                                  detailFasilitas.filePendukung.some(file => file.jenis_file === '360') ? (
                                    <div className="bg-gray-200 rounded-md aspect-video flex items-center justify-center overflow-hidden">
                                      {detailFasilitas.filePendukung
                                        .filter(file => file.jenis_file === '360')
                                        .map((file, index) => (
                                          <a
                                            key={index}
                                            href={`http://127.0.0.1:8000/api/fasilitas/files/${file.id_file_pendukung}/view`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full h-full flex items-center justify-center"
                                          >
                                            <div className="text-center">
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-12 w-12 mx-auto text-blue-500"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                                                />
                                              </svg>
                                              <span className="mt-2 text-sm font-medium text-blue-600">
                                                Klik untuk melihat tampilan 360°
                                              </span>
                                            </div>
                                          </a>
                                        ))}
                                    </div>
                                  ) : (
                                    <div className="bg-gray-100 rounded-md p-4 text-center">
                                      <p className="text-sm text-gray-500">
                                        Tidak ada tampilan 360° yang tersedia
                                      </p>
                                    </div>
                                  )}
                                </div>
                
                                {/* Inventory Section */}
                                <div>
                                  <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
                                      Daftar Inventaris
                                    </h3>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                      {detailFasilitas.inventaris?.length || 0} Item
                                    </span>
                                  </div>
                
                                  {detailFasilitas.inventaris?.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                      <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-100">
                                            <tr>
                                              <th
                                                scope="col"
                                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                              >
                                                Nama Barang
                                              </th>
                                              <th
                                                scope="col"
                                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                              >
                                                Jumlah
                                              </th>
                                              <th
                                                scope="col"
                                                className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                              >
                                                Kondisi
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                            {detailFasilitas.inventaris.map((item, index) => (
                                              <tr
                                                key={index}
                                                className={
                                                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                }
                                              >
                                                <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                  {item.nama_barang}
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                                  <div className="flex items-center">
                                                    <span>{item.jumlah}</span>
                                                    <span className="ml-1 text-xs text-gray-400">
                                                      {item.satuan}
                                                    </span>
                                                  </div>
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap">
                                                  <span
                                                    className={`px-2 py-1 text-xs font-medium rounded-full ${getConditionBadge(
                                                      item.kondisi
                                                    )}`}
                                                  >
                                                    {getConditionLabel(item.kondisi)}
                                                  </span>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-8 w-8 mx-auto text-gray-400"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                        />
                                      </svg>
                                      <p className="mt-2 text-sm text-gray-500">
                                        Tidak ada data inventaris untuk fasilitas ini
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                
                            {/* Action Buttons - Sticky Bottom */}
                            <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200">
                              <div className="px-4">
                                <button
                                  onClick={() => {
                                    if (mapInstanceRef.current && detailFasilitas.geojson) {
                                      const layer = L.geoJSON(detailFasilitas.geojson);
                                      mapInstanceRef.current.fitBounds(layer.getBounds(), {
                                        padding: [50, 50],
                                      });
                                    }
                                  }}
                                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  Navigasi ke Lokasi
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                
                      <div
                        ref={mapRef}
                        className="w-full h-full"
                        style={{ minHeight: "600px" }}
                      />
                    </div>
                  );
                };
                
                export default PublicPetaTanah;
                