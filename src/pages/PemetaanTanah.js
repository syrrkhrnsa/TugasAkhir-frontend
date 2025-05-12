import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as wellknown from "wellknown";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { getTanahPopupHTML } from "../components/PemetaanTanah/PopupTanah";
import { getMarkerPopupHTML } from "../components/PemetaanTanah/MarkerPopupContent";
import { getDetailFasilitasHTML } from "../components/PemetaanTanah/GetDetailFasilitas";
import { getFasilitasPopupHTML } from "../components/PemetaanTanah/FasilitasPopupCard";
import FasilitasModal from "../components/PemetaanTanah/c_pemetaan_fasilitas";
import * as turf from "@turf/turf";
import Swal from "sweetalert2";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

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
  const [tanahData, setTanahData] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  // Konfigurasi Map Tiles
  const MAP_TILES = {
    "MapTiler Satellite": {
      url: "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=insgtVNzCo53KJvnDTe0",
      attribution: "© MapTiler",
    },
    "Google Satelit": {
      url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
      attribution: "Google Satelit",
    },
    "Open Street Maps": {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "Open Street Maps",
    },
  };

  // Fungsi utama untuk mengambil semua data
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!tanahId) {
        throw new Error("ID Tanah tidak valid");
      }

      const [tanahRes, pemetaanRes, sertifikatRes] = await Promise.all([
        axios.get(`http://127.0.0.1:8000/api/tanah/${tanahId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://127.0.0.1:8000/api/pemetaan-tanah/${tanahId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`http://127.0.0.1:8000/api/sertifikat/tanah/${tanahId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setTanahData(tanahRes.data.data || {});
      setSertifikatData(sertifikatRes.data.data || []);

      if (pemetaanRes.data.data && pemetaanRes.data.data.length > 0) {
        setDataExists(true);
        const processedData = pemetaanRes.data.data.map((item) => ({
          ...item,
          geojson: wkbToGeoJSON(item.geometri),
        }));
        setPemetaanData(processedData);
        await fetchFasilitasData(processedData);
      } else {
        setDataExists(false);
        setPemetaanData([]);
        setFasilitasData([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err.response?.data?.message || err.message || "Gagal memuat data"
      );
      setPemetaanData([]);
      setFasilitasData([]);
    } finally {
      setLoading(false);
    }
  }, [tanahId]);

  const fetchFasilitasData = async (pemetaanData) => {
    try {
      const token = localStorage.getItem("token");
      let allFasilitasData = [];

      if (pemetaanData && pemetaanData.length > 0) {
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

        const results = await Promise.all(fetchPromises);
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
      const area =
        geometry.type === "Polygon"
          ? turf.area(turf.polygon(geometry.coordinates))
          : 0;

      const formData = {
        nama_pemetaan: `Pemetaan ${new Date().toLocaleDateString()}`,
        keterangan: `Dibuat pada ${new Date().toLocaleString()}`,
        jenis_geometri: "POLYGON",
        geometri: JSON.stringify(geometry),
        luas_tanah: area,
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

      if (response.data.calculated_area && tanahData.luasTanah) {
        const diff = Math.abs(
          tanahData.luasTanah - response.data.calculated_area
        );
        const percentage = (diff / tanahData.luasTanah) * 100;

        Swal.fire({
          icon: "info",
          title: "Hasil Pemetaan Disimpan",
          html: `
            <b>Luas tanah hasil pemetaan:</b> ${response.data.calculated_area.toFixed(
              2
            )} m²<br>
            <b>Luas tanah asli:</b> ${tanahData.luasTanah} m²<br>
            <b>Selisih:</b> ${diff.toFixed(2)} m² (${percentage.toFixed(2)}%)
          `,
          confirmButtonText: "OK",
        });
      }
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
      await fetchFasilitasData(pemetaanData);
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
      await axios.delete(`http://127.0.0.1:8000/api/pemetaan/tanah/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
      await axios.delete(`http://127.0.0.1:8000/api/pemetaan/fasilitas/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchFasilitasData(pemetaanData);
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
        await fetchFasilitasData(dataWithGeoJSON);
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

  // Inisialisasi peta
  const initializeMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

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

    baseLayers["Google Satelit"].addTo(mapInstance);
    L.control
      .layers(baseLayers, null, { position: "topright" })
      .addTo(mapInstance);

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

    const geocoder = L.Control.Geocoder.nominatim();

    if (URLSearchParams && location.search) {
      const params = new URLSearchParams(location.search);
      const query = params.get("q");
      if (query) {
        geocoder.geocode(query, function (results) {
          if (results.length > 0) {
            mapInstance.fitBounds(results[0].bbox);
          }
        });
      }
    }

    L.control
      .zoom({
        position: "topright",
      })
      .addTo(mapInstance);

    L.Control.geocoder({
      defaultMarkGeocode: false,
      position: "topright",
      placeholder: "Cari lokasi...",
      errorMessage: "Lokasi tidak ditemukan",
      geocoder: geocoder,
    })
      .on("markgeocode", function (e) {
        const bbox = e.geocode.bbox;
        mapInstance.fitBounds(bbox, { padding: [50, 50] });
      })
      .addTo(mapInstance);

    return mapInstance;
  };

  // Setup draw control
  const setupDrawControl = (mapInstance) => {
    if (drawControlRef.current) {
      mapInstance.removeControl(drawControlRef.current);
    }

    const hasExistingPemetaan = pemetaanData && pemetaanData.length > 0;

    const drawOptions = {
      edit: {
        featureGroup:
          mode === "facility"
            ? fasilitasLayerRef.current
            : drawnItemsRef.current,
        poly: { allowIntersection: false },
      },
      draw: {
        marker: false,
        circlemarker: false,
        circle: false,
        polyline: false,
        rectangle: mode !== "facility" && !hasExistingPemetaan,
        polygon: {
          allowIntersection: false,
          showArea: true,
          allowDrawing: mode === "facility" || !hasExistingPemetaan,
        },
      },
    };

    drawControlRef.current = new L.Control.Draw(drawOptions);
    mapInstance.addControl(drawControlRef.current);

    mapInstance.off(L.Draw.Event.CREATED);
    mapInstance.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      const geoJSON = layer.toGeoJSON().geometry;

      if (mode === "facility") {
        fasilitasLayerRef.current.addLayer(layer);
        setFasilitasFormData((prev) => ({
          ...prev,
          geometri: geoJSON,
          pemetaanTanahId: selectedPemetaanId,
        }));
        setShowFasilitasModal(true);
      } else {
        if (!hasExistingPemetaan) {
          drawnItemsRef.current.addLayer(layer);
          savePemetaanData(geoJSON);
        } else {
          mapInstance.removeLayer(layer);
          Swal.fire({
            icon: "warning",
            title: "Pemetaan Tanah Sudah Ada",
            text: "Anda tidak dapat menambahkan pemetaan tanah lagi karena sudah ada data pemetaan.",
            confirmButtonText: "OK",
          });
        }
      }
    });
  };

  const renderMapData = (mapInstance) => {
    if (!mapInstance) return;

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

    if (dataExists && pemetaanData.length > 0) {
      const geoJSONGroup = L.featureGroup();

      pemetaanData.forEach((item) => {
        if (item.geojson && item.geojson.geometry) {
          try {
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

                popupContent.innerHTML = getTanahPopupHTML(
                  item,
                  tanahData,
                  sertifikatData
                );

                const deleteButton = popupContent.querySelector(".btn-delete");
                if (deleteButton) {
                  deleteButton.onclick = () => {
                    if (
                      window.confirm(
                        "Apakah Anda yakin ingin menghapus pemetaan ini?"
                      )
                    ) {
                      deletePemetaan(item.id_pemetaan_tanah);
                    }
                  };
                }

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
                if (zoomButton) {
                  zoomButton.onclick = () => {
                    mapInstance.fitBounds(bounds, { padding: [50, 50] });
                    marker.closePopup();
                  };
                }

                const deleteMarkerButton =
                  markerPopupContent.querySelector(".btn-delete-marker");
                if (deleteMarkerButton) {
                  deleteMarkerButton.onclick = () => {
                    if (
                      window.confirm(
                        "Apakah Anda yakin ingin menghapus pemetaan ini?"
                      )
                    ) {
                      deletePemetaan(item.id_pemetaan_tanah);
                    }
                  };
                }

                const addFasilitasButton =
                  markerPopupContent.querySelector(".add-fasilitas");
                if (addFasilitasButton) {
                  addFasilitasButton.onclick = () => {
                    setMode("facility");
                    setSelectedPemetaanId(item.id_pemetaan_tanah);
                    setupDrawControl(mapInstance);
                    marker.closePopup();
                  };
                }
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
      modal.className =
        "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4";

      modal.innerHTML = getDetailFasilitasHTML(detailData, {
        ...fasilitasData,
        tanahData,
      });

      document.body.appendChild(modal);

      const actionButton = modal.querySelector(".btn-action-fasilitas");
      if (actionButton) {
        actionButton.addEventListener("click", () => {
          if (detailData && detailData.id_fasilitas) {
            navigate(`/fasilitas/detail/${detailData.id_fasilitas}`, {
              state: {
                pemetaanData: fasilitasData,
                detailData: detailData,
                tanahData: tanahData,
              },
            });
          } else {
            navigate(`/fasilitas/create`, {
              state: {
                pemetaanFasilitasId: fasilitasData.id_pemetaan_fasilitas,
                tanahData: tanahData,
              },
            });
          }
          document.body.removeChild(modal);
        });
      }

      const editButton = modal.querySelector(".btn-edit-detail");
      if (editButton) {
        if (detailData && detailData.id_fasilitas) {
          editButton.style.display = "block";
          editButton.addEventListener("click", () => {
            document.body.removeChild(modal);
            navigate(`/fasilitas/edit/${detailData.id_fasilitas}`, {
              state: {
                pemetaanFasilitasData: fasilitasData || [],
                tanahData: tanahData || [],
                detailData: detailData || {},
              },
            });
          });
        } else {
          editButton.style.display = "none";
        }
      }

      const closeButtons = modal.querySelectorAll(".btn-close-modal");
      closeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          document.body.removeChild(modal);
        });
      });
    };

    if (fasilitasData.length > 0) {
      const fetchAllFacilityDetails = async () => {
        const token = localStorage.getItem("token");
        const detailsPromises = fasilitasData.map(async (pemetaanItem) => {
          try {
            // First check if we have a corresponding fasilitas record
            const response = await axios.get(
              `http://127.0.0.1:8000/api/fasilitas/pemetaan/${pemetaanItem.id_pemetaan_fasilitas}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                validateStatus: (status) => status === 200 || status === 404,
              }
            );

            if (response.status === 404) {
              return {
                ...pemetaanItem,
                hasDetail: false,
                detailData: null,
                status: "not_found",
              };
            }

            // If we have facility details, fetch the files
            const fasilitasId = response.data.data.id_fasilitas;
            const filesResponse = await axios.get(
              `http://127.0.0.1:8000/api/fasilitas/${fasilitasId}/files`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            return {
              ...pemetaanItem,
              hasDetail: true,
              detailData: {
                ...response.data.data,
                filePendukung: filesResponse.data.data || [],
              },
              status: "found",
            };
          } catch (err) {
            console.error(
              `Error fetching fasilitas for pemetaan ${pemetaanItem.id_pemetaan_fasilitas}:`,
              err
            );
            return {
              ...pemetaanItem,
              hasDetail: false,
              detailData: null,
              status: "error",
            };
          }
        });

        return Promise.all(detailsPromises);
      };

      fetchAllFacilityDetails()
        .then((enrichedFacilities) => {
          enrichedFacilities.forEach((item) => {
            if (
              !item.geojson ||
              !item.geojson.geometry ||
              !item.geojson.geometry.coordinates
            ) {
              console.warn(
                "Skipping facility with invalid geometry:",
                item.id_pemetaan_fasilitas
              );
              return;
            }

            try {
              const geoJSONLayer = L.geoJSON(item.geojson, {
                style: {
                  color: "#0066ff",
                  weight: 3,
                  opacity: 1,
                  fillOpacity: 0.3,
                },
                onEachFeature: (feature, layer) => {
                  try {
                    const popupContent = document.createElement("div");
                    popupContent.className =
                      "p-4 min-w-[280px] max-w-[320px] bg-white rounded-lg shadow-md border border-gray-100";

                    popupContent.innerHTML = getFasilitasPopupHTML({
                      ...item,
                      lokasi: tanahData.lokasi || "Tidak tersedia",
                      filePendukung: item.detailData?.filePendukung || [],
                    });

                    const deleteButton = popupContent.querySelector(
                      ".btn-delete-fasilitas"
                    );
                    if (deleteButton) {
                      deleteButton.onclick = () => {
                        if (
                          window.confirm(
                            "Apakah Anda yakin ingin menghapus fasilitas ini?"
                          )
                        ) {
                          deleteFasilitas(item.id_pemetaan_fasilitas);
                        }
                      };
                    }

                    if (item.hasDetail) {
                      const viewDetailButton =
                        popupContent.querySelector(".btn-view-detail");
                      if (viewDetailButton) {
                        viewDetailButton.onclick = () => {
                          showDetailModal(item.detailData, item);
                        };
                      }
                    }

                    layer.bindPopup(popupContent);
                  } catch (popupErr) {
                    console.error("Error creating popup:", popupErr);
                    layer.bindPopup("Error loading facility details");
                  }
                },
              });
              fasilitasLayerRef.current.addLayer(geoJSONLayer);
              mapInstance.addLayer(geoJSONLayer);
            } catch (geoErr) {
              console.error(
                "Error displaying facility geometry:",
                geoErr,
                item
              );
            }
          });
        })
        .catch((err) => {
          console.error("Error processing facility details:", err);
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

  useEffect(() => {
    if (pemetaanData.length > 0) {
      fetchFasilitasData(pemetaanData);
    }
  }, [pemetaanData]);

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
  }, [loading]);

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

      <FasilitasModal
        showFasilitasModal={showFasilitasModal}
        fasilitasFormData={fasilitasFormData}
        handleFasilitasInputChange={handleFasilitasInputChange}
        setShowFasilitasModal={setShowFasilitasModal}
        resetFasilitasForm={resetFasilitasForm}
        fasilitasLayerRef={fasilitasLayerRef}
        saveFasilitasData={saveFasilitasData}
      />

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
