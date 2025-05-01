import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as wellknown from "wellknown";

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
  const [sertifikatData, setSertifikatData] = useState([]);

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

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch public pemetaan data
      const pemetaanRes = await axios.get("http://127.0.0.1:8000/api/pemetaan/public");
      const pemetaan = (pemetaanRes.data.data || []).map((item) => ({
        ...item,
        geojson: item.geometri ? wkbToGeoJSON(item.geometri) : null,
      }));
      setPemetaanData(pemetaan);

      // Fetch public fasilitas data
      const fasilitasRes = await axios.get("http://127.0.0.1:8000/api/fasilitas/public");
      const fasilitas = (fasilitasRes.data.data || []).map((item) => ({
        ...item,
        geojson: item.geometri ? wkbToGeoJSON(item.geometri) : null,
      }));
      setFasilitasData(fasilitas);

      // If there's pemetaan data, fetch related tanah and sertifikat data
      if (pemetaan.length > 0 && pemetaan[0].id_tanah) {
        try {
          const tanahRes = await axios.get(`http://127.0.0.1:8000/api/tanah/public/${pemetaan[0].id_tanah}`);
          setTanahData(tanahRes.data.data || {});
          
          const sertifikatRes = await axios.get(`http://127.0.0.1:8000/api/sertifikat/public?id_tanah=${pemetaan[0].id_tanah}`);
          setSertifikatData(sertifikatRes.data.data || []);
        } catch (err) {
          console.error("Error fetching additional data:", err);
          // Continue even if these requests fail
        }
      }
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
      zoomControl: true,
      maxZoom: 22,
      minZoom: 10,
    }).setView([-7.0456, 107.5886], 16);
    mapInstanceRef.current = map;

    // Base layers
    const baseLayers = {
      "MapTiler Satellite": L.tileLayer(
        "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=insgtVNzCo53KJvnDTe0",
        {
          attribution: "© MapTiler",
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

    baseLayers["MapTiler Satellite"].addTo(map);
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
  };

  const renderMapData = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    drawnItemsRef.current.clearLayers();
    fasilitasLayerRef.current.clearLayers();

    const geoJSONGroup = L.featureGroup();

    // Render land mappings with markers and info
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
              // Popup for the polygon
              const popupContent = document.createElement("div");
              popupContent.className = "p-4 min-w-[240px] font-sans bg-white rounded-lg shadow-lg";
              
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
                      <h3 class="text-lg font-semibold text-gray-800">${item.nama_pemetaan || "Pemetaan Tanah"}</h3>
                    </div>
                  </div>
              
                  <!-- Main Info Section -->
                  <div class="bg-gray-50 p-4 rounded-md space-y-3">
                    <!-- Location -->
                    <div class="flex items-start text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 mr-3 text-gray-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.05 3.636a7 7 0 119.9 9.9l-4.243 4.243a1 1 0 01-1.414 0l-4.243-4.243a7 7 0 010-9.9zm4.95 3.364a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd" />
                      </svg>
                      <div>
                        <div class="font-medium text-gray-700">Lokasi:</div>
                        <div class="text-xs text-gray-600 mt-1">${tanahData?.lokasi || 'Tidak tersedia'}</div>
                      </div>
                    </div>
              
                    <!-- Land Area -->
                    <div class="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      <span>
                        <span class="font-medium text-gray-700">Luas Tanah:</span> 
                        ${tanahData?.luasTanah 
                          ? new Intl.NumberFormat('id-ID').format(tanahData.luasTanah) + ' m²' 
                          : 'Tidak tersedia'}
                      </span>
                    </div>
              
                    <!-- Wakif Name -->
                    <div class="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.486 0 4.823.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>
                        <span class="font-medium text-gray-700">Nama Wakif:</span> ${tanahData?.NamaWakif || 'Tidak tersedia'}
                      </span>
                    </div>
                  </div>
              
                  <!-- Legal Documents Section -->
                  <div class="mb-4">
                    <h4 class="font-medium text-sm text-gray-700 mb-2">Legalitas Tanah:</h4>
                    ${sertifikatData.length > 0 
                      ? sertifikatData.map(sertifikat => `
                        <div class="mb-2 p-2 bg-gray-100 rounded">
                          <div class="flex justify-between items-center">
                            <span class="font-medium text-sm">${sertifikat.jenis_sertifikat || 'Tidak diketahui'}</span>
                            <span class="text-xs ${
                              sertifikat.status_pengajuan === 'Terbit' ? 'bg-green-100 text-green-800' 
                              : sertifikat.status_pengajuan === 'Ditolak' ? 'bg-red-100 text-red-800' 
                              : 'bg-yellow-100 text-yellow-800'
                            } px-2 py-1 rounded-full">
                              ${sertifikat.status_pengajuan || 'Proses'}
                            </span>
                          </div>
                          <div class="text-xs text-gray-500 mt-2 space-y-1">
                            <div class="flex items-center">
                              No: ${sertifikat.no_dokumen || 'Belum Tersedia'}
                            </div>
                            <div class="flex items-center">
                              Tanggal Pengajuan: ${
                                sertifikat.tanggal_pengajuan 
                                ? new Date(sertifikat.tanggal_pengajuan).toLocaleDateString() 
                                : '-'
                              }
                            </div>
                          </div>
                        </div>
                      `).join('') 
                      : '<p class="text-sm text-gray-500 italic">Belum ada data legalitas</p>'
                    }
                  </div>

                  <!-- Additional Notes -->
                  <div class="p-3 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-700">${item.keterangan || "Tidak ada keterangan tambahan"}</p>
                  </div>
                </div>
              `;

              layer.bindPopup(popupContent);

              // Add marker at center with zoom button
              const bounds = layer.getBounds();
              const center = bounds.getCenter();

              const marker = L.marker(center, {
                icon: new L.Icon.Default(),
              }).addTo(map);

              const markerPopupContent = document.createElement("div");
              markerPopupContent.className = "p-3 min-w-[220px] max-w-[260px] bg-white rounded-lg shadow-lg border border-gray-200";
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
                </div>
              `;

              const zoomButton = markerPopupContent.querySelector(".zoom-to-location");
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
              color: "#0066ff", // Blue for facility mapping
              weight: 3,
              opacity: 1,
              fillOpacity: 0.3,
            },
            onEachFeature: function (feature, layer) {
              const popupContent = document.createElement("div");
              popupContent.className = "p-4 min-w-[280px] max-w-[320px] bg-white rounded-lg shadow-md border border-gray-100";
              popupContent.innerHTML = `
                <div class="mb-4">
                  <!-- Header with icon and title -->
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
                
                <!-- Description box -->
                <div class="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 class="text-xs font-bold text-gray-700 mb-1">KETERANGAN</h4>
                  <p class="text-sm text-gray-700">${item.keterangan || "Tidak ada keterangan tambahan"}</p>
                </div>
              
                <!-- Asset type -->
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
              `;

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
    } else if (!loading) {
      // Show no data notice if loading is complete and no data
      const noDataNotice = L.control({ position: "topright" });
      noDataNotice.onAdd = function () {
        const div = L.DomUtil.create("div", "no-data-notice");
        div.innerHTML = `
          <div class="p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
            <p class="font-bold">Belum ada data pemetaan</p>
          </div>
        `;
        return div;
      };
      noDataNotice.addTo(map);
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
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{ minHeight: "600px" }}
      />
    </div>
  );
};

export default PublicPetaTanah;