const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('❌ MONGODB_URI no está definida en las variables de entorno');
    }

    console.log('🔗 Intentando conectar a MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB - Monitoreo Impresoras');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    console.log('🔍 Variables disponibles:', {
      hasMongoURI: !!process.env.MONGODB_URI,
      port: process.env.PORT,
      nodeEnv: process.env.NODE_ENV
    });
    process.exit(1);
  }
};

module.exports = connectDB;