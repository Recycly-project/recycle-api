// Modul utilitas untuk penanganan error yang konsisten di seluruh aplikasi.

// Fungsi untuk menangani error server (internal server error)
const handleServerError = (
  h,
  error,
  customMessage = 'Terjadi kesalahan pada server. Silakan coba lagi.'
) => {
  // Catat detail error ke konsol untuk debugging.
  // Di lingkungan produksi, Anda mungkin ingin menggunakan logger yang lebih canggih.
  console.error('Unhandled server error:', error);

  // Mengirim respons error 500 (Internal Server Error)
  return h
    .response({
      status: 'error',
      message: customMessage,
      // Di lingkungan produksi, 'error: error.message' mungkin ingin disembunyikan
      // untuk mencegah kebocoran informasi sensitif.
      error: error.message,
    })
    .code(500);
};

// Fungsi untuk menangani error client (misal: input tidak valid, resource tidak ditemukan)
const handleClientError = (
  h,
  message,
  statusCode = 400,
  errorDetail = null
) => {
  // Mengirim respons error dengan status code yang ditentukan (default 400 Bad Request)
  return h
    .response({
      status: 'fail',
      message: message,
      // Menambahkan detail error jika disediakan, berguna untuk validasi atau pesan spesifik.
      ...(errorDetail && { data: errorDetail }),
    })
    .code(statusCode);
};

module.exports = {
  handleServerError,
  handleClientError,
};
