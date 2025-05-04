// FasilitasModal.js
import React from "react";

const FasilitasModal = ({
  showFasilitasModal,
  fasilitasFormData,
  handleFasilitasInputChange,
  setShowFasilitasModal,
  resetFasilitasForm,
  fasilitasLayerRef,
  saveFasilitasData,
}) => {
  if (!showFasilitasModal) return null;

  return (
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
                checked={fasilitasFormData.jenis_fasilitas === "Tidak Bergerak"}
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
  );
};

export default FasilitasModal;
