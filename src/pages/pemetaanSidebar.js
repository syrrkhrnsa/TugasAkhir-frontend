import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar.js";
import FasilitasPopupCard from "../components/PemetaanSidebar/FasilitasPopupCard";
import { getFasilitasModalHTML } from "../components/PemetaanSidebar/getFasilitasModalHTML.js";
import { getPopupTanahHTML } from "../components/PemetaanSidebar/PopupTanah";
import { getMarkerPopupHTML } from "../components/PemetaanSidebar/MarkerPopupContent";
import FasilitasListCard from "../components/PemetaanSidebar/FasilitasListCard";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as wellknown from "wellknown";
import { createRoot } from "react-dom/client";
import { useNavigate } from "react-router-dom";

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const PemetaanSidebar = () => {
  const { id } = useParams();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [pemetaanData, setPemetaanData] = useState([]);
  const [fasilitasData, setFasilitasData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const drawnItemsRef = useRef(null);
  const fasilitasLayerRef = useRef(null);
  const navigate = useNavigate();
  const [tanahData, setTanahData] = useState({});
  const [sertifikatData, setSertifikatData] = useState([]);
  const [fasilitasDetailData, setFasilitasDetailData] = useState({});
  const [showFacilityList, setShowFacilityList] = useState(true);

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

      console.log("API response:", response.data);
      console.log("ID Pemetaan Fasilitas:", id_pemetaan_fasilitas);

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
        `http://127.0.0.1:8000/api/pemetaan/tanah`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        // Fetch tanah data for each pemetaan
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

  const fetchFasilitasData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/pemetaan/fasilitas`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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

  const PopupContent = ({ item, onDelete, navigate }) => {
    const [detailData, setDetailData] = useState(null);
    const popupRef = useRef(null);

    useEffect(() => {
      console.log(
        "ID Fasilitas yang diproses (PopupContent):",
        item.id_pemetaan_fasilitas
      );
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
        // Make sure detailData is fully loaded before showing the modal
        console.log("Detail data:", detailData); // Add this for debugging
        showDetailModal(detailData, item);
      } else {
        navigate("/fasilitas/create", {
          state: {
            fasilitas: item,
          },
        });
      }
    };

    const handleAddInventaris = () => {
      navigate("/inventaris/create", {
        state: {
          fasilitas: item,
        },
      });
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

  const showDetailModal = (detailData, fasilitasData) => {
    console.log("=== DETAIL DATA ===", detailData);
    console.log("=== FASILITAS DATA ===", fasilitasData);

    // Cek spesifik nilai file_gambar
    console.log("Nilai detailData.file_gambar:", detailData[0]?.file_gambar);

    // Ensure we have valid data objects to work with
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
      if (!detailData || typeof detailData.id_fasilitas === "undefined") {
        console.error(
          "Cannot view inventory: detailData is missing or invalid",
          detailData
        );
        alert("Data fasilitas tidak valid. Tidak dapat melihat inventaris.");
        return;
      }

      document.body.removeChild(modal);
      navigate(`/inventaris/fasilitas/${detailData.id_fasilitas}`, {
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
    }).setView([-7.0456, 107.5886], 13);

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

    return mapInstance;
  };

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
                color: "#ffff", // Red for land mapping
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
            console.log(
              "id pemetaan fasilitas lain : ",
              item.id_pemetaan_fasilitas
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

      // Kemudian render semua fasilitas setelah data lengkap
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

  useEffect(() => {
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
        <h2 className="text-xl font-medium">Pemetaan Tanah</h2>
        <p className="text-gray-500">PC Persis Banjaran</p>
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
              {fasilitasData.length > 0 ? (
                fasilitasData.map((item) => (
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
                  Tidak ada data fasilitas
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
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
              {error}
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
