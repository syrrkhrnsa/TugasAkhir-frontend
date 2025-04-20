import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import * as wellknown from "wellknown";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

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
    jenis_fasilitas: "",
    nama_fasilitas: "",
    keterangan: "",
    geometri: null,
    jenis_geometri: "POLYGON",
    pemetaanTanahId: null,
  });

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

    // Add custom control button for Facility Mapping
    const facilityControlButton = L.Control.extend({
      options: {
        position: "topleft",
      },

      onAdd: function (map) {
        const container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control"
        );
        const button = L.DomUtil.create(
          "a",
          "facility-control-button",
          container
        );
        button.href = "#";
        button.title = "Add Pemetaan Fasilitas/Aset";
        button.innerHTML = '<span style="font-size:18px">🏢</span>';
        button.style.display = "flex";
        button.style.alignItems = "center";
        button.style.justifyContent = "center";
        button.style.backgroundColor = "#fff";
        button.style.width = "30px";
        button.style.height = "30px";

        L.DomEvent.on(button, "click", function (e) {
          L.DomEvent.stopPropagation(e);
          L.DomEvent.preventDefault(e);

          // Toggle facility mapping mode
          if (isAddingFasilitas) {
            setIsAddingFasilitas(false);
            button.style.backgroundColor = "#fff";
            // Remove any temporary draw controls
            if (mapInstance._toolbars && mapInstance._toolbars.draw) {
              mapInstance.removeControl(mapInstance._toolbars.draw);
            }
          } else {
            setIsAddingFasilitas(true);
            button.style.backgroundColor = "#4CAF50";

            // Add draw control specifically for facilities
            const facilityDrawControl = new L.Control.Draw({
              edit: {
                featureGroup: fasilitasLayer,
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

            mapInstance.addControl(facilityDrawControl);
          }
        });

        return container;
      },
    });

    mapInstance.addControl(new facilityControlButton());

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
                popupContent.innerHTML = `
                  <b>${item.nama_pemetaan}</b><br>
                  ${item.keterangan || "Tidak ada keterangan"}<br>
                  Jenis: ${item.jenis_geometri}<br><br>
                  <button class="btn-delete bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">
                    Hapus Pemetaan
                  </button>
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
                markerPopupContent.innerHTML = `
                  <b>${item.nama_pemetaan}</b><br>
                  <button class="zoom-to-location bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-sm">
                    📍 Lihat Lokasi
                  </button>
                  <button class="btn-delete-marker bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm mt-2">
                    Hapus Pemetaan
                  </button>
                  <button class="add-fasilitas bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm mt-2">
                    ➕ Add Pemetaan Fasilitas
                  </button>
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
                color: "#0066ff", // Blue for facility mapping
                weight: 3,
                opacity: 1,
                fillOpacity: 0.3,
              },
              onEachFeature: function (feature, layer) {
                const popupContent = document.createElement("div");
                popupContent.innerHTML = `
                  <b>${item.nama_fasilitas}</b><br>
                  Jenis: ${item.jenis_fasilitas}<br>
                  ${item.keterangan || "Tidak ada keterangan"}<br><br>
                  <button class="btn-delete-fasilitas bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-sm">
                    Hapus Fasilitas
                  </button>
                `;

                const deleteButton = popupContent.querySelector(
                  ".btn-delete-fasilitas"
                );
                deleteButton.onclick = () => {
                  if (
                    window.confirm(
                      "Apakah Anda yakin ingin menghapus fasilitas ini?"
                    )
                  ) {
                    deleteFasilitas(item.id_pemetaan_fasilitas);
                  }
                };

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
      jenis_fasilitas: "",
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
              <select
                name="jenis_fasilitas"
                value={fasilitasFormData.jenis_fasilitas}
                onChange={handleFasilitasInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              >
                <option value="">Pilih Jenis Fasilitas</option>
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
