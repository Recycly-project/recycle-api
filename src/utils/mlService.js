// Modul interaksi dengan API Machine Learning

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const config = require('../config');

/**
 * Kirim gambar ke ML API.
 * @param {string} imagePath
 * @returns {Promise<object>}
 */
const sendImageToML = async (imagePath) => {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));

  const apiResponse = await axios.post(config.mlApiUrl, formData, {
    headers: formData.getHeaders(),
  });

  return apiResponse.data;
};

module.exports = {
  sendImageToML,
};
