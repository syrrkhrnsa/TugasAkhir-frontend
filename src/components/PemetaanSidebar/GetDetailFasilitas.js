export function getFasilitasModalHTML(fasilitasData, detailData) {
  return `
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div class="p-8">
          <!-- Header with close button -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <h3 class="text-2xl font-bold text-gray-800">Detail Fasilitas</h3>
            </div>
            <button class="btn-close-modal p-2 rounded-full hover:bg-gray-100 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Main Content -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Fasilitas Info Card -->
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-blue-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-gray-800">Informasi Fasilitas</h4>
              </div>
              
              <div class="space-y-4">
                <div class="grid grid-cols-3 gap-4">
                  <div>
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</p>
                    <p class="font-medium mt-1">${
                      fasilitasData?.nama_fasilitas || "Tidak tersedia"
                    }</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</p>
                    <p class="font-medium mt-1">${
                      fasilitasData?.kategori_fasilitas || "Tidak tersedia"
                    }</p>
                  </div>
                  <div>
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Aset</p>
                    <p class="font-medium mt-1">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        fasilitasData?.jenis_fasilitas === "Bergerak"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }">
                        ${fasilitasData?.jenis_fasilitas || "Tidak tersedia"}
                      </span>
                    </p>
                  </div>
                </div>
                
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</p>
                  <p class="text-gray-700 mt-1">${
                    fasilitasData?.keterangan || "Tidak ada keterangan"
                  }</p>
                </div>
                
                <!-- Facility Images Section -->
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar Fasilitas</p>
                  <div class="mt-2 grid grid-cols-3 gap-2">
                    ${
                      detailData[0].file_gambar
                        ? `
                      <div class="relative group aspect-square">
                        <img src="http://127.0.0.1:8000/storage/${detailData[0].file_gambar}" 
                             alt="Gambar Fasilitas" 
                             class="w-full h-full object-cover rounded-lg border border-gray-200">
                        <a href="http://127.0.0.1:8000/storage/${detailData[0].file_gambar}" 
                           target="_blank" 
                           class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg">
                          <span class="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-2 py-1 rounded-full text-xs flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat
                          </span>
                        </a>
                      </div>
                    `
                        : `
                      <div class="aspect-square bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    `
                    }
                    ${
                      detailData[0].file_gambar2
                        ? `
                      <div class="relative group aspect-square">
                        <img src="http://127.0.0.1:8000/storage/${detailData[0].file_gambar2}" 
                             alt="Gambar Fasilitas 2" 
                             class="w-full h-full object-cover rounded-lg border border-gray-200">
                        <a href="http://127.0.0.1:8000/storage/${detailData[0].file_gambar2}" 
                           target="_blank" 
                           class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg">
                          <span class="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-2 py-1 rounded-full text-xs flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat
                          </span>
                        </a>
                      </div>
                    `
                        : `
                      <div class="aspect-square bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    `
                    }
                    ${
                      detailData[0].file_gambar3
                        ? `
                      <div class="relative group aspect-square">
                        <img src="http://127.0.0.1:8000/storage/${detailData[0].file_gambar3}" 
                             alt="Gambar Fasilitas 3" 
                             class="w-full h-full object-cover rounded-lg border border-gray-200">
                        <a href="http://127.0.0.1:8000/storage/${detailData[0].file_gambar3}" 
                           target="_blank" 
                           class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg">
                          <span class="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-2 py-1 rounded-full text-xs flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Lihat
                          </span>
                        </a>
                      </div>
                    `
                        : `
                      <div class="aspect-square bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    `
                    }
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Detail Info Card -->
            <div class="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div class="flex items-center gap-3 mb-4">
                <div class="bg-purple-100 p-3 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-gray-800">Detail Tambahan</h4>
              </div>
              
              <div class="space-y-4">
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</p>
                  <div class="mt-1 p-3 bg-white rounded border border-gray-200">
                    <p class="text-gray-700">${
                      detailData[0].catatan || "Tidak ada catatan"
                    }</p>
                  </div>
                </div>
                
                <!-- 360° View Button -->
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">View 360°</p>
                  ${
                    detailData[0].file_360
                      ? `
                      <div class="mt-2">
                        <a href="http://127.0.0.1:8000/storage/${detailData[0].file_360}" target="_blank" rel="noopener noreferrer">
                          <button class="btn-view-360 w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                            </svg>
                            Buka View 360°
                          </button>
                        </a>
                      </div>
                    `
                      : `
                      <div class="mt-2 p-4 bg-gray-100 rounded-lg border border-dashed border-gray-300 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        <p class="mt-2 text-sm text-gray-500">View 360° tidak tersedia</p>
                      </div>
                    `
                  }
                </div>
                
                <!-- PDF Preview Section -->
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Dokumen PDF</p>
                  ${
                    detailData[0].file_pdf
                      ? `
                    <div>
                      <a href="http://127.0.0.1:8000/storage/${detailData[0].file_pdf}" 
                         target="_blank" 
                         class="inline-flex items-center mt-1 text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Lihat Dokumen
                      </a>
                    </div>
                  `
                      : `
                    <div class="mt-2 p-4 bg-gray-100 rounded-lg border border-dashed border-gray-300 text-center">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <p class="mt-2 text-sm text-gray-500">Dokumen PDF tidak tersedia</p>
                    </div>
                  `
                  }
                </div>
              </div>
            </div>
          </div>
          
          <!-- Action Buttons -->
          <div class="mt-8 flex justify-end space-x-3 border-t pt-6">
            <button class="btn-close-modal px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">
              Tutup
            </button>
            <button class="btn-view-inventaris px-5 py-2.5 bg-green-600 rounded-lg text-white hover:bg-green-700 transition-colors font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Lihat Inventaris
            </button>
            <button class="btn-edit-detail px-5 py-2.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Detail
            </button>
          </div>
        </div>
      </div>
    `;
}
