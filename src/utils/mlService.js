// Modul ini bertanggung jawab untuk berinteraksi dengan API Machine Learning.
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const config = require('../config'); // Mengambil ML_API_URL dari konfigurasi global

// Fungsi untuk mengirim gambar ke API ML
const sendImageToML = async (imagePath) => {
  const formData = new FormData();
  // Menambahkan file gambar ke FormData sebagai stream
  formData.append('image', fs.createReadStream(imagePath));

  // Mengirim permintaan POST ke ML_API_URL dengan gambar
  const apiResponse = await axios.post(config.mlApiUrl, formData, {
    headers: formData.getHeaders(), // Penting untuk menginisialisasi header FormData
  });

  return apiResponse.data; // Mengembalikan data respons dari ML API
};

module.exports = {
  sendImageToML,
};
