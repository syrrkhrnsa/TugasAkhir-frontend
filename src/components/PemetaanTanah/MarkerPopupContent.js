export const getMarkerPopupHTML = (item) => {
  return `
      <div class="mb-4">
                    <!-- Header with map-themed design -->
                    <div class="flex items-center gap-3 pb-2 border-b border-gray-100">
                      <div class="bg-blue-100 p-2 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                      </div>
                      <div>
                        <h3 class="font-bold text-gray-800">Area Pemetaan</h3>
                        <p class="text-xs text-gray-500 mt-1">${item.nama_pemetaan}</p>
                      </div>
                    </div>
                  </div>
                
                  <!-- Action buttons with improved styling -->
                  <div class="space-y-2">
                    <button class="zoom-to-location w-full flex items-center justify-between px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-md transition-colors border border-blue-100">
                      <span class="text-sm">Navigasi ke Lokasi</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    
                    <button class="add-fasilitas w-full flex items-center justify-between px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors border border-green-100">
                      <span class="text-sm">Buat Pemetaan Fasilitas</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                    
                    <button class="btn-delete-marker w-full flex items-center justify-between px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors border border-red-100">
                      <span class="text-sm">Hapus Area Ini</span>
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                `;
};
