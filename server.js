const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');

const connectDB = require('./config/database');
const impresorasRoutes = require('./routes/impresoras');

const app = express();
const PORT = 8080; // Puerto fijo para Railway

// Conectar a la base de datos
connectDB();

// Schema de Usuario para login
const usuarioSchema = new mongoose.Schema({
  email: String,
  password: String,
  activo: Boolean,
  empresaId: String,
  ciudad: String
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

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

// Endpoint de Login
app.post('/login', async (req, res) => {
  const { email, password, ciudad } = req.body;
  
  try {
    const usuario = await Usuario.findOne({ email, ciudad });
    
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const passwordOk = await bcrypt.compare(password, usuario.password);
    if (!passwordOk) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Licencia inactiva, contacta a soporte' });
    }

    res.json({ 
      message: 'Login exitoso',
      empresaId: usuario.empresaId,
      email: usuario.email,
      ciudad: usuario.ciudad
    });
    
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Backend de Monitoreo de Impresoras funcionando',
    version: '1.0.0',
    database: 'monitoreo_impresoras',
    endpoints: {
      empresas: '/api/empresas',
      impresoras: '/api/empresas/:empresaId/impresoras',
      metrics: '/api/metrics/impresoras',
      cortes: '/api/impresoras/:id/registrar-corte',
      pdf: '/api/impresoras/:id/generar-pdf',
      login: '/login'
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de Monitoreo corriendo en puerto ${PORT}`);
  console.log(`📊 Base de datos: monitoreo_impresoras`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🔗 MongoDB: Cluster0`);
});