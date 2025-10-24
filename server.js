const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const impresorasRoutes = require('./routes/impresoras');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));

// Configuración CORS básica
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Rutas
app.use('/', impresorasRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend de Monitoreo de Impresoras funcionando',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      empresas: '/api/empresas',
      impresoras: '/api/empresas/:empresaId/impresoras',
      metrics: '/api/metrics/impresoras',
      cortes: '/api/impresoras/:id/registrar-corte',
      pdf: '/api/impresoras/:id/generar-pdf'
    }
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ 
    ok: false, 
    error: 'Endpoint no encontrado',
    path: req.path
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error('❌ Error global:', error);
  res.status(500).json({ 
    ok: false, 
    error: 'Error interno del servidor' 
  });
});

// Conectar a la base de datos y luego iniciar servidor
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de Monitoreo corriendo en puerto ${PORT}`);
    console.log(`📊 Base de datos: Monitoreo Impresoras`);
    console.log(`📍 URL: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(error => {
  console.error('❌ No se pudo iniciar la aplicación:', error);
  process.exit(1);
});