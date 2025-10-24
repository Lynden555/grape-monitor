const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // URL hardcodeada como en el backend original
    const mongoURI = 'mongodb+srv://DiegoLLera:666bonus@cluster0.l40i6a0.mongodb.net/monitoreo_impresoras?retryWrites=true&w=majority&appName=Cluster0';
    
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Conectado a MongoDB - Monitoreo Impresoras');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;