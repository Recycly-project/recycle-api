const tf = require('@tensorflow/tfjs');
const path = require('path');

let model;

const loadModel = async () => {
  if (!model) {
    try {
      const modelPath = path.resolve(
        __dirname,
        '../../model/tfjs_model/model.json'
      );
      model = await tf.loadGraphModel(`file://${modelPath}`);
      console.log('Model berhasil dimuat');
    } catch (error) {
      console.error('Gagal memuat model:', error);
    }
  }
  return model;
};

const predict = async (inputData) => {
  if (!model) {
    await loadModel();
  }

  try {
    // Buat tensor dari input
    const inputTensor = tf.tensor2d([inputData], [1, inputData.length]); // [1, n]
    const prediction = model.predict(inputTensor);

    // Check if prediction is valid
    if (!prediction || !prediction.dataSync) {
      throw new Error('Model prediction failed.');
    }

    // Ekstrak probabilitas dan konversi ke true/false
    const probabilities = prediction.dataSync(); // Array hasil prediksi
    const isBottle = probabilities[0] >= 0.5; // Ambang batas 0.5

    // Bersihkan memori
    tf.dispose([inputTensor, prediction]);

    return isBottle; // Hasil boolean
  } catch (error) {
    console.error('Kesalahan pada prediksi model:', error);
    throw new Error('Gagal memproses data menggunakan model ML.');
  }
};

module.exports = { loadModel, predict };
