import React, { useEffect, useRef, useState } from "react";
import Sidebar from "../components/Sidebar.js";
import FasilitasPopupCard from "../components/PemetaanSidebar/FasilitasPopupCard";
import { getFasilitasModalHTML } from "../components/PemetaanSidebar/GetDetailFasilitas.js";
import { getPopupTanahHTML } from "../components/PemetaanSidebar/PopupTanah";
import { getMarkerPopupHTML } from "../components/PemetaanSidebar/MarkerPopupContent";
import FasilitasListCard from "../components/PemetaanSidebar/FasilitasListCard";
import L from "leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as wellknown from "wellknown";
import { createRoot } from "react-dom/client";

import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const PemetaanSidebar = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [pemetaanData, setPemetaanData] = useState([]);
  const [fasilitasData, setFasilitasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const drawnItemsRef = useRef(null);
  const fasilitasLayerRef = useRef(null);
  const navigate = useNavigate();
  const [showFacilityList, setShowFacilityList] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [facilitySearchTerm, setFacilitySearchTerm] = useState("");
  const location = useLocation();

  // Filter facilities based on search term
  const filteredFacilities = fasilitasData.filter((facility) =>
    facility.nama_fasilitas.toLowerCase().includes(facilitySearchTerm.toLowerCase())
  );

  // Fetch data user untuk dropdown filter
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`http://127.0.0.1:8000/api/data/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Gagal memuat daftar user");
    }
  };

  // Modifikasi fetchPemetaanData untuk menerima parameter userId
  const fetchPemetaanData = async (userId = null) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      let url = `http://127.0.0.1:8000/api/pemetaan/tanah`;

      if (userId) {
        url = `http://127.0.0.1:8000/api/pemetaan/user/pemetaan-tanah/${userId}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data && response.data.data.length > 0) {
        const enrichedData = await Promise.all(
          response.data.data.map(async (item) => {
            const tanah = await fetchTanahData(item.id_tanah);
            const sertifikat = await fetchSertifikatData(item.id_tanah);
            const geojson = item.geometri ? wkbToGeoJSON(item.geometri) : null;

            return {
              ...item,
              geojson,
              tanahData: tanah,
              sertifikatData: sertifikat,
            };
          })
        );

        setPemetaanData(enrichedData);
      } else {
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

  // Modifikasi fetchFasilitasData untuk menerima parameter userId
  const fetchFasilitasData = async (userId = null) => {
    try {
      const token = localStorage.getItem("token");
      let url = `http://127.0.0.1:8000/api/pemetaan/fasilitas`;

      if (userId) {
        url = `http://127.0.0.1:8000/api/pemetaan/user/pemetaan-fasilitas/${userId}`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.data && response.data.data.length > 0) {
        const dataWithGeoJSON = response.data.data.map((item) => {
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
    } catch (err) {
      console.error("Error fetching fasilitas data:", err);
      setFasilitasData([]);
    }
  };

  // Handler untuk filter berdasarkan user
  const handleFilterByUser = (userId) => {
    setSelectedUserId(userId);
    setIsDropdownOpen(false);
    setSearchTerm("");
    setFacilitySearchTerm(""); // Reset facility search when changing user filter
    fetchPemetaanData(userId);
    fetchFasilitasData(userId);
  };

  // Handler untuk reset filter
  const handleResetFilter = () => {
    setSelectedUserId(null);
    setIsDropdownOpen(false);
    setSearchTerm("");
    setFacilitySearchTerm(""); // Reset facility search when resetting all filters
    fetchPemetaanData();
    fetchFasilitasData();
  };

  // Filter users berdasarkan search term
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk konversi WKB ke GeoJSON
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

  // Fungsi untuk fetch detail tanah
  const fetchTanahData = async (tanahId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/tanah/${tanahId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data || {};
    } catch (err) {
      console.error("Error fetching tanah data:", err);
      return {};
    }
  };

  // Fungsi untuk fetch sertifikat
  const fetchSertifikatData = async (tanahId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/sertifikat/tanah/${tanahId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.data || [];
    } catch (err) {
      console.error("Error fetching sertifikat data:", err);
      return [];
    }
  };

  // Fungsi untuk fetch detail fasilitas
  const fetchFasilitasDetailData = async (id_pemetaan_fasilitas) => {
    if (!id_pemetaan_fasilitas) {
      console.error("ID Pemetaan Fasilitas tidak valid");
      return null;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/fasilitas/pemetaan/${id_pemetaan_fasilitas}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        console.warn("No detail data found in response", response);
        return null;
      }
    } catch (err) {
      console.error("Error fetching fasilitas detail data:", err);
      return null;
    }
  };

  // Fungsi untuk inisialisasi peta
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Clear existing map
    while (mapRef.current.firstChild) {
      mapRef.current.removeChild(mapRef.current.firstChild);
    }

    // Initialize map with higher zoom level
    const mapInstance = L.map(mapRef.current, {
      zoomControl: false,
      maxZoom: 22,
      minZoom: 10,
    }).setView([-7.0456, 107.5886], 13);

    mapInstanceRef.current = mapInstance;

    // Base layers
    const baseLayers = {
      "MapTiler Satellite": L.tileLayer(
        "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=insgtVNzCo53KJvnDTe0",
        {
          attribution: "© MapTiler",
          maxZoom: 22,
          noWrap: false,
        }
      ),
      "Google Satelit": L.tileLayer(
        "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        {
          attribution: "Google Satelit",
          maxZoom: 22,
          noWrap: false,
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

    // Add default layer
    baseLayers["Google Satelit"].addTo(mapInstance);

    // Add layer control
    L.control
      .layers(baseLayers, null, { position: "topright" })
      .addTo(mapInstance);

    // Add labels layer
    L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
      {
        attribution: "Labels © Esri",
        maxZoom: 22,
        noWrap: false,
      }
    ).addTo(mapInstance);

    const geocoder = L.Control.Geocoder.nominatim();
    
    if (URLSearchParams && location.search) {
      const params = new URLSearchParams(location.search);
      const query = params.get('q');
      if (query) {
        geocoder.geocode(query, function(results) {
          if (results.length > 0) {
            mapInstance.fitBounds(results[0].bbox);
          }
        });
      }
    }

    // Tambahkan kontrol zoom custom di atas kanan
    L.control.zoom({
      position: 'topright'
    }).addTo(mapInstance);

    // Tambahkan geocoder di bawah kontrol zoom
    L.Control.geocoder({
      defaultMarkGeocode: false,
      position: 'topright',
      placeholder: 'Cari lokasi...',
      errorMessage: 'Lokasi tidak ditemukan',
      geocoder: geocoder
    })
    .on('markgeocode', function(e) {
      const bbox = e.geocode.bbox;
      mapInstance.fitBounds(bbox, { padding: [50, 50] });
    })
    .addTo(mapInstance);

    // Layer untuk pemetaan tanah
    const drawnItemsLayer = new L.FeatureGroup();
    mapInstance.addLayer(drawnItemsLayer);
    drawnItemsRef.current = drawnItemsLayer;

    // Layer untuk fasilitas
    const fasilitasLayer = new L.FeatureGroup();
    mapInstance.addLayer(fasilitasLayer);
    fasilitasLayerRef.current = fasilitasLayer;

    return mapInstance;
  };

  // Fungsi untuk render data ke peta
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
    if (pemetaanData.length > 0) {
      const geoJSONGroup = L.featureGroup();

      pemetaanData.forEach((item) => {
        if (item.geojson && item.geojson.geometry) {
          try {
            const geoJSONLayer = L.geoJSON(item.geojson, {
              style: {
                color: "#ffff",
                weight: 3,
                opacity: 1,
                fillOpacity: 0.3,
              },
              onEachFeature: function (feature, layer) {
                const popupContent = document.createElement("div");
                popupContent.className =
                  "p-4 min-w-[240px] font-sans bg-white rounded-lg shadow-lg";

                popupContent.innerHTML = getPopupTanahHTML(item);

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
                markerPopupContent.innerHTML = getMarkerPopupHTML(item);

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
          </div>
        `;
        return div;
      };
      noDataNotice.addTo(mapInstance);
    }

    // Render fasilitas mappings
    if (fasilitasData.length > 0) {
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
              detailData: response.data.data?.[0] || null,
            };
          } catch (err) {
            console.error("Error fetching facility details:", err);
            return {
              ...item,
              hasDetail: false,
              detailData: null,
            };
          }
        });

        return Promise.all(detailsPromises);
      };

      fetchAllFacilityDetails().then((enrichedFacilities) => {
        enrichedFacilities.forEach((item) => {
          if (item.geojson && item.geojson.geometry) {
            try {
              const geoJSONLayer = L.geoJSON(item.geojson, {
                style: {
                  color: "#FECC23",
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
      });
    }
  };

  // Komponen PopupContent untuk fasilitas
  const PopupContent = ({ item, onDelete, navigate }) => {
    const [detailData, setDetailData] = useState(null);
    const popupRef = useRef(null);

    useEffect(() => {
      if (item.id_pemetaan_fasilitas) {
        const checkDetail = async () => {
          const data = await fetchFasilitasDetailData(
            item.id_pemetaan_fasilitas
          );
          setDetailData(data);
        };
        checkDetail();
      }
    }, [item.id_pemetaan_fasilitas]);

    const handleDetailAction = () => {
      if (detailData) {
        showDetailModal(detailData, item);
      } else {
        navigate(`/fasilitas/create/${item.id_pemetaan_fasilitas}`, {
          state: {
            fasilitas: item,
          },
        });
      }
    };

    return (
      <FasilitasPopupCard
        item={item}
        popupRef={popupRef}
        detailData={detailData}
        handleDetailAction={handleDetailAction}
        onDelete={onDelete}
      />
    );
  };

  // Fungsi untuk menampilkan modal detail
  const showDetailModal = (detailData, fasilitasData) => {
    if (!detailData) {
      console.error("Detail data is missing or invalid");
      alert("Error: Data detail fasilitas tidak ditemukan.");
      return;
    }

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";

    modal.innerHTML = getFasilitasModalHTML(fasilitasData, detailData);

    document.body.appendChild(modal);

    // Handle tombol Lihat Inventaris
    const viewInventarisButton = modal.querySelector(".btn-view-inventaris");
    viewInventarisButton.addEventListener("click", () => {
      if (!detailData || typeof detailData[0].id_fasilitas === "undefined") {
        console.error(
          "Cannot view inventory: detailData is missing or invalid",
          detailData
        );
        alert("Data fasilitas tidak valid. Tidak dapat melihat inventaris.");
        return;
      }

      document.body.removeChild(modal);
      navigate(`/inventaris/fasilitas/${detailData[0].id_fasilitas}`, {
        state: {
          fasilitasData: fasilitasData || {},
          detailData: detailData || {},
        },
      });
    });

    // Handle edit button
    const editButton = modal.querySelector(".btn-edit-detail");
    editButton.addEventListener("click", () => {
      if (!detailData || typeof detailData[0].id_fasilitas === "undefined") {
        console.error(
          "Cannot edit: detailData is missing or invalid",
          detailData
        );
        alert("Data fasilitas tidak valid. Tidak dapat melanjutkan edit.");
        return;
      }

      document.body.removeChild(modal);
      navigate(`/fasilitas/edit/${detailData[0].id_fasilitas}`, {
        state: {
          pemetaanFasilitasData: fasilitasData || [],
          detailData: detailData || {},
        },
      });
    });

    // Handle 360° view button if exists
    if (detailData.file_360) {
      const view360Button = modal.querySelector(".btn-view-360");
      if (view360Button) {
        view360Button.addEventListener("click", () => {
          window.open(
            `http://127.0.0.1:8000/storage/${detailData.file_360}`,
            "_blank"
          );
        });
      }
    }

    // Handle close buttons
    const closeButtons = modal.querySelectorAll(".btn-close-modal");
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        document.body.removeChild(modal);
      });
    });
  };

  // Fungsi untuk menghapus pemetaan
  const deletePemetaan = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/pemetaan/tanah/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchPemetaanData(selectedUserId);
    } catch (err) {
      console.error("Gagal menghapus data pemetaan:", err);
      alert(
        `Gagal menghapus data pemetaan: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  // Fungsi untuk menghapus fasilitas
  const deleteFasilitas = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/api/pemetaan/fasilitas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchFasilitasData(selectedUserId);
    } catch (err) {
      console.error("Gagal menghapus data fasilitas:", err);
      alert(
        `Gagal menghapus data fasilitas: ${
          err.response?.data?.message || err.message
        }`
      );
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchPemetaanData();
    fetchFasilitasData();
  }, []);

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
  }, [loading, pemetaanData, fasilitasData]);

  return (
    <Sidebar>
      <div className="p-4 bg-white rounded-lg shadow-md mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium">Pemetaan Tanah</h2>
            <p className="text-gray-500">PC Persis Banjaran</p>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                  clipRule="evenodd"
                />
              </svg>
              {selectedUserId
                ? `Filter: ${
                    users.find((u) => u.id === selectedUserId)?.name || "User"
                  }`
                : "Filter by Pimpinan Jamaah"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-200 ${
                  isDropdownOpen ? "transform rotate-180" : ""
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50 border border-gray-200 overflow-hidden">
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Cari user..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="max-h-60 overflow-y-auto">
                  <button
                    onClick={handleResetFilter}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                      !selectedUserId
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                      />
                    </svg>
                    Semua Data
                  </button>
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleFilterByUser(user.id)}
                      className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                        selectedUserId === user.id
                          ? "bg-blue-50 text-blue-600"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      {user.name}
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                      Tidak ditemukan user
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-180px)]">
        {/* Sidebar List di kiri */}
        {showFacilityList && (
          <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto">
            <div className="p-4 sticky top-0 bg-white border-b border-gray-200 z-10">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium">Daftar Fasilitas</h2>
                <button
                  onClick={() => setShowFacilityList(false)}
                  className="p-1 rounded-full hover:bg-gray-100"
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
              <div className="mt-3 relative">
                <input
                  type="text"
                  placeholder="Cari fasilitas..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={facilitySearchTerm}
                  onChange={(e) => setFacilitySearchTerm(e.target.value)}
                />
                <div className="absolute left-3 top-2.5 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {filteredFacilities.length > 0 ? (
                filteredFacilities.map((item) => (
                  <FasilitasListCard
                    key={item.id_pemetaan_fasilitas}
                    item={item}
                    onClick={() => {
                      if (item.geojson) {
                        const layer = L.geoJSON(item.geojson);
                        if (layer.getBounds) {
                          mapInstanceRef.current.fitBounds(layer.getBounds(), {
                            padding: [50, 50],
                            maxZoom: 18,
                          });
                        }
                      }
                    }}
                  />
                ))
              ) : (
                <div className="p-4 text-center text-gray-500">
                  {loading ? "Memuat data..." : "Tidak ada data fasilitas yang cocok"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Area di kanan */}
        <div className="flex-1 relative">
          {!showFacilityList && (
            <button
              onClick={() => setShowFacilityList(true)}
              className="absolute top-4 left-4 z-10 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          )}

          {error && (
            <div className="absolute top-4 left-4 right-4 z-10 p-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                <p className="text-gray-600">Memuat peta...</p>
              </div>
            </div>
          )}

          <div
            ref={mapRef}
            className="z-0 border border-gray-300 rounded-lg w-full h-full"
          />
        </div>
      </div>
    </Sidebar>
  );
};

export default PemetaanSidebar;