// Konfigurasi dasar aplikasi
const config = {
  // URL API dasar (diambil dari environment variable atau default localhost)
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",

  // Timeout untuk request API (dalam milidetik)
  API_TIMEOUT: 30000,

  // Konfigurasi khusus untuk upload file
  UPLOAD_CONFIG: {
    maxFileSize: 5 * 1024 * 1024, // 5MB dalam bytes
    allowedTypes: ["application/pdf"],
    chunkSize: 1024 * 1024, // 1MB per chunk untuk upload besar
  },

  // Konfigurasi headers default
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Endpoint spesifik (jika diperlukan)
  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      LOGOUT: "/auth/logout",
      PROFILE: "/auth/me",
    },
    SERTIFIKAT: "/sertifikat",
    TANAH: "/tanah",
    // Tambahkan endpoint lain sesuai kebutuhan
  },

  // Konfigurasi error handling
  ERROR_MESSAGES: {
    NETWORK_ERROR:
      "Tidak dapat terhubung ke server. Periksa koneksi internet Anda.",
    TIMEOUT_ERROR: "Request timeout. Server terlalu lama merespon.",
    SERVER_ERROR: "Terjadi kesalahan pada server.",
    UNAUTHORIZED: "Anda tidak memiliki akses. Silakan login kembali.",
  },
};

export default config;
