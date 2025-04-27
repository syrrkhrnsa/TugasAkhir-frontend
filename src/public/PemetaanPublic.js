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
      const [pemetaanRes, fasilitasRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/pemetaan/public"),
        axios.get("http://127.0.0.1:8000/api/fasilitas/public"),
      ]);

      const pemetaan = (pemetaanRes.data.data || []).map((item) => ({
        ...item,
        geojson: item.geometri ? wkbToGeoJSON(item.geometri) : null,
      }));

      const fasilitas = (fasilitasRes.data.data || []).map((item) => ({
        ...item,
        geojson: item.geometri ? wkbToGeoJSON(item.geometri) : null,
      }));

      setPemetaanData(pemetaan);
      setFasilitasData(fasilitas);
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
              popupContent.innerHTML = `
                <div class="p-2">
                  <h3 class="font-bold text-lg">${
                    item.nama_pemetaan || "Tanah"
                  }</h3>
                  <p class="text-sm">${
                    item.keterangan || "Tidak ada keterangan"
                  }</p>
                  <p class="text-xs text-gray-500">Jenis: ${
                    item.jenis_geometri
                  }</p>
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
              markerPopupContent.innerHTML = `
                <div class="p-2">
                  <h3 class="font-bold">${item.nama_pemetaan || "Tanah"}</h3>
                  <button class="zoom-to-location mt-2 w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded text-sm">
                    📍 Lihat Lokasi
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
              color: "#0066ff", // Blue for facility mapping
              weight: 3,
              opacity: 1,
              fillOpacity: 0.3,
            },
            onEachFeature: function (feature, layer) {
              const popupContent = document.createElement("div");
              popupContent.innerHTML = `
                <div class="p-2">
                  <h3 class="font-bold text-lg">${
                    item.nama_fasilitas || "Fasilitas"
                  }</h3>
                  <p class="text-sm">Jenis: ${item.jenis_fasilitas}</p>
                  <p class="text-sm">${
                    item.keterangan || "Tidak ada keterangan"
                  }</p>
                </div>
              `;
              layer.bindPopup(popupContent);

              // Add marker for point features or center for polygons
              if (item.geojson.geometry.type === "Point") {
                const marker = L.marker(
                  [
                    item.geojson.geometry.coordinates[1],
                    item.geojson.geometry.coordinates[0],
                  ],
                  {
                    icon: new L.Icon.Default(),
                  }
                ).addTo(map);

                marker.bindPopup(popupContent);
              } else {
                // For polygons, add marker at center
                const bounds = layer.getBounds();
                const center = bounds.getCenter();

                const marker = L.marker(center, {
                  icon: new L.Icon.Default(),
                }).addTo(map);

                marker.bindPopup(popupContent);
              }
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
  }, [loading, pemetaanData, fasilitasData]);

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
