// Utilitas untuk penanganan error aplikasi

/**
 * Tangani error server (500).
 * @param {object} h
 * @param {Error} error
 * @param {string} customMessage
 * @returns {object} response
 */
const handleServerError = (
  h,
  error,
  customMessage = 'Terjadi kesalahan pada server. Silakan coba lagi.'
) => {
  console.error('Unhandled server error:', error);

  return h
    .response({
      status: 'error',
      message: customMessage,
      error: error.message, // Di production bisa disembunyikan
    })
    .code(500);
};

/**
 * Tangani error client (4xx).
 * @param {object} h
 * @param {string} message
 * @param {number} statusCode
 * @param {object|null} errorDetail
 * @returns {object} response
 */
const handleClientError = (
  h,
  message,
  statusCode = 400,
  errorDetail = null
) => {
  return h
    .response({
      status: 'fail',
      message,
      ...(errorDetail && { data: errorDetail }),
    })
    .code(statusCode);
};

module.exports = {
  handleServerError,
  handleClientError,
};
