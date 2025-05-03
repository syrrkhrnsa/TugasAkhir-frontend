export function getPopupTanahHTML(item, onDelete) {
  return `
                    <!-- Header -->
                    <div class="mb-4">
                      <div class="flex items-center gap-3 mb-2">
                        <div class="bg-blue-100 p-2 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </div>
                        <h3 class="text-lg font-semibold text-gray-800">${
                          item.nama_pemetaan
                        }</h3>
                      </div>
                    </div>
                
                    <!-- Main Info Section -->
                    <div class="bg-gray-50 p-4 rounded-md space-y-3">
                      <!-- Location - Modified with larger icon and smaller text -->
                      <div class="flex items-start text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 mr-3 text-gray-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M5.05 3.636a7 7 0 119.9 9.9l-4.243 4.243a1 1 0 01-1.414 0l-4.243-4.243a7 7 0 010-9.9zm4.95 3.364a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd" />
                        </svg>
                        <div>
                          <div class="font-medium text-gray-700">Lokasi:</div>
                          <div class="text-xs text-gray-600 mt-1">${
                            item.tanahData?.lokasi || "Tidak tersedia"
                          }</div>
                        </div>
                      </div>
                
                      <!-- Land Area -->
                      <div class="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        <span>
                          <span class="font-medium text-gray-700">Luas Tanah:</span> 
                          ${
                            item.tanahData?.luasTanah
                              ? new Intl.NumberFormat("id-ID").format(
                                  item.tanahData.luasTanah
                                ) + " m²"
                              : "Tidak tersedia"
                          }
                        </span>
                      </div>
                
                      <!-- Wakif Name -->
                      <div class="flex items-center text-sm text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.486 0 4.823.657 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>
                          <span class="font-medium text-gray-700">Nama Wakif:</span> ${
                            item.tanahData?.NamaWakif || "Tidak tersedia"
                          }
                        </span>
                      </div>
                    </div>
                
                    <!-- Legal Documents Section -->
                    <div class="mb-4">
                      <h4 class="font-medium text-sm text-gray-700 mb-2">Legalitas Tanah:</h4>
                      ${
                        item.sertifikatData.length > 0
                          ? item.sertifikatData
                              .map(
                                (sertifikat) => `
                          <div class="mb-2 p-2 bg-gray-100 rounded">
                            <div class="flex justify-between items-center">
                              <span class="font-medium text-sm">${
                                sertifikat.jenis_sertifikat || "Tidak diketahui"
                              }</span>
                              <span class="text-xs ${
                                sertifikat.status_pengajuan === "Terbit"
                                  ? "bg-green-100 text-green-800"
                                  : sertifikat.status_pengajuan === "Ditolak"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              } px-2 py-1 rounded-full">
                                ${sertifikat.status_pengajuan || "Proses"}
                              </span>
                            </div>
                            <div class="text-xs text-gray-500 mt-2 space-y-1">
                              <div class="flex items-center">
                                No: ${sertifikat.no_dokumen || "Belum Tersedia"}
                              </div>
                              <div class="flex items-center">
                                Tanggal Pengajuan: ${
                                  sertifikat.tanggal_pengajuan
                                    ? new Date(
                                        sertifikat.tanggal_pengajuan
                                      ).toLocaleDateString()
                                    : "-"
                                }
                              </div>
                            </div>
                          </div>
                        `
                              )
                              .join("")
                          : '<p class="text-sm text-gray-500 italic">Belum ada data legalitas</p>'
                      }
                    </div>

                    <!-- Additional Notes -->
                    <div class="p-3 bg-gray-50 rounded-lg">
                      <p class="text-sm text-gray-700">${
                        item.keterangan || "Tidak ada keterangan tambahan"
                      }</p>
                    </div>
                
                    <!-- Delete button -->
                    <div class="flex justify-end pt-3 border-t border-gray-200">
                      <button class="btn-delete flex items-center px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-md transition-colors text-sm font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </div>
                `;
}
