export const getDetailFasilitasHTML = (detailData, pemetaanData) => {
  // Check if we have valid detail data
  const hasDetail = detailData && detailData.detailData.id_fasilitas;
  console.log("Detail Data :", detailData);
  console.log("pemetaan data :", pemetaanData);
  console.log("has detail:", hasDetail);

  // Extract files by type from detailData or fallback to empty arrays
  const files360 = hasDetail
    ? (detailData.detailData.file_pendukung || []).filter(
        (f) => f.jenis_file === "360"
      )
    : [];
  const filesGambar = hasDetail
    ? (detailData.detailData.file_pendukung || []).filter(
        (f) => f.jenis_file === "gambar"
      )
    : [];
  const filesDokumen = hasDetail
    ? (detailData.detailData.file_pendukung || []).filter(
        (f) => f.jenis_file === "dokumen"
      )
    : [];

  // Function to generate file display HTML (ukuran lebih kecil)
  const renderFilePreview = (file, is360 = false) => {
    const isImage = file.mime_type.startsWith("image/");
    const isPDF = file.mime_type === "application/pdf";
    const fileUrl = `http://127.0.0.1:8000/api/fasilitas/files/${file.id_file_pendukung}/view`;
    console.log("file:", file);

    if (isImage) {
      return `
        <div class="relative group flex-shrink-0" style="width: 100px; height: 100px;">
          <img src="${fileUrl}" 
               alt="${file.nama_asli}" 
               class="w-full h-full object-cover rounded-lg border border-gray-200">
          <a href="${fileUrl}" 
             target="_blank" 
             class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg">
            <span class="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-2 py-1 rounded-full text-xs flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              ${is360 ? "360°" : "Lihat"}
            </span>
          </a>
        </div>
      `;
    } else if (isPDF) {
      return `
        <div class="relative group flex-shrink-0" style="width: 100px; height: 100px;">
          <div class="w-full h-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span class="text-xs text-gray-700 text-center truncate w-full">${file.nama_asli}</span>
          </div>
          <a href="${fileUrl}" 
             target="_blank" 
             class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg">
            <span class="opacity-0 group-hover:opacity-100 text-white bg-black bg-opacity-50 px-2 py-1 rounded-full text-xs flex items-center">
              Lihat
            </span>
          </a>
        </div>
      `;
    } else {
      return `
        <div class="flex-shrink-0" style="width: 100px; height: 100px;">
          <div class="w-full h-full bg-gray-100 rounded-lg border border-dashed border-gray-300 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      `;
    }
  };

  return `
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div class="p-6">
        <!-- Header with close button -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h3 class="text-xl font-bold text-gray-800">
              ${hasDetail ? "Detail Fasilitas" : "Informasi Pemetaan Fasilitas"}
            </h3>
            ${
              !hasDetail
                ? `
              <p class="text-sm text-gray-500 mt-1">
                Detail fasilitas belum tersedia. Data berikut dari pemetaan fasilitas.
              </p>
            `
                : ""
            }
          </div>
          <button class="btn-close-modal p-2 rounded-full hover:bg-gray-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Main Content -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- Fasilitas Info Card -->
          <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div class="flex items-center gap-2 mb-3">
              <div class="bg-blue-100 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h4 class="text-md font-semibold text-gray-800">Informasi Fasilitas</h4>
            </div>
            
            <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</p>
                  <p class="font-medium text-sm mt-1">${
                    detailData.nama_fasilitas
                  }</p>
                </div>
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</p>
                  <p class="font-medium text-sm mt-1">${
                    detailData.kategori_fasilitas
                  }</p>
                </div>
              </div>
              
              <div>
                <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Keterangan</p>
                <p class="text-gray-700 text-sm mt-1">${
                  detailData.keterangan || "Tidak ada keterangan"
                }</p>
              </div>
              
              ${
                filesGambar.length > 0
                  ? `
                <!-- Facility Images Section -->
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Gambar Fasilitas</p>
                    ${
                      filesGambar.length > 3
                        ? '<span class="text-xs text-gray-500">Geser untuk melihat lebih banyak</span>'
                        : ""
                    }
                  </div>
                  <div class="relative">
                    <div class="overflow-x-auto pb-2 scrollbar-hide">
                      <div class="flex space-x-2" style="width: max-content">
                        ${filesGambar.map(renderFilePreview).join("")}
                      </div>
                    </div>
                  </div>
                </div>
              `
                  : ""
              }
            </div>
          </div>
          
          ${
            hasDetail
              ? `
            <!-- Detail Info Card -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div class="flex items-center gap-2 mb-3">
                <div class="bg-purple-100 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 class="text-md font-semibold text-gray-800">Detail Tambahan</h4>
              </div>
              
              <div class="space-y-3">
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</p>
                  <div class="mt-1 p-2 bg-white rounded border border-gray-200 text-sm">
                    <p class="text-gray-700">${
                      detailData.detailData.catatan || "Tidak ada catatan"
                    }</p>
                  </div>
                </div>
                
                <!-- 360° View Section -->
                <div>
                  <div class="flex justify-between items-center mb-1">
                    <p class="text-xs font-medium text-gray-500 uppercase tracking-wider">View 360°</p>
                    ${
                      files360.length > 3
                        ? '<span class="text-xs text-gray-500">Geser untuk melihat lebih banyak</span>'
                        : ""
                    }
                  </div>
                  ${
                    files360.length > 0
                      ? `
                        <div class="relative">
                          <div class="overflow-x-auto pb-2 scrollbar-hide">
                            <div class="flex space-x-2" style="width: max-content">
                              ${files360
                                .map((file) => renderFilePreview(file, true))
                                .join("")}
                            </div>
                          </div>
                        </div>
                      `
                      : `
                        <div class="text-center py-3 text-sm text-gray-500 bg-gray-100 rounded border border-dashed border-gray-300">
                          Tidak ada 360°
                        </div>
                      `
                  }
                </div>
                
                <!-- PDF Preview Section -->
                <div>
                  <p class="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Dokumen PDF</p>
                  ${
                    filesDokumen.length > 0
                      ? `
                        <div class="space-y-2 max-h-40 overflow-y-auto">
                          ${filesDokumen
                            .map(
                              (file) => `
                            <div class="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-sm">
                              <div class="flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <span class="text-gray-700 truncate">${file.nama_asli}</span>
                              </div>
                              <a href="http://127.0.0.1:8000/api/fasilitas/files/${file.id_file_pendukung}/view" 
                                 target="_blank" 
                                 class="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                Lihat
                              </a>
                            </div>
                          `
                            )
                            .join("")}
                        </div>
                      `
                      : `
                        <div class="text-center py-3 text-sm text-gray-500 bg-gray-100 rounded border border-dashed border-gray-300">
                          Tidak ada dokumen
                        </div>
                      `
                  }
                </div>
              </div>
            </div>
          `
              : `
            <!-- Empty State for Detail -->
            <div class="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 class="text-md font-medium text-gray-700 mb-1">Detail Fasilitas Belum Tersedia</h4>
              <p class="text-xs text-gray-500 text-center mb-3">Buat detail fasilitas untuk menambahkan informasi lebih lengkap</p>
              <a href="/fasilitas/create/${pemetaanData.id_pemetaan_fasilitas}" class="btn-create-fasilitas px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 text-sm font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Buat Fasilitas
              </a>
            </div>
          `
          }
        </div>
        
        <!-- Action Buttons -->
        <div class="mt-6 flex justify-end space-x-2 border-t pt-4">
          <button class="btn-close-modal px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium">
            Tutup
          </button>
          
          ${
            hasDetail
              ? `
            <!-- Log Activity Button - Added with purple color scheme -->
            <a href="/log?type=fasilitas&id=${detailData.detailData.id_fasilitas}" 
              class="btn-view-log px-4 py-2 bg-purple-600 rounded-lg text-white hover:bg-purple-700 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Aktivitas
            </a>
            
            <a href="/inventaris/fasilitas/${detailData.detailData.id_fasilitas}" class="btn-view-inventaris px-4 py-2 bg-green-600 rounded-lg text-white hover:bg-green-700 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Inventaris
            </a>
            <a href="/fasilitas/edit/${detailData.detailData.id_fasilitas}" class="btn-edit-detail px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </a>
          `
              : `
            <a href="/fasilitas/create/${pemetaanData.id_pemetaan_fasilitas}" class="btn-create-fasilitas px-4 py-2 bg-blue-600 rounded-lg text-white hover:bg-blue-700 text-sm font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Buat Fasilitas
            </a>
          `
          }
        </div>
      </div>
    </div>
    <style>
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    </style>
  `;
};
