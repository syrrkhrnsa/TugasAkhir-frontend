export const getFasilitasPopupHTML = (item) => {
  const actionButton = renderActionButton(item);

  return `
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
};

const renderActionButton = (item) => {
  return item.hasDetail
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
};
