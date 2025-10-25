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
  email: { type: String, unique: true },
  password: String,
  activo: { type: Boolean, default: false },
  ciudad: String,
  empresaId: String,
  fechaRegistro: { type: Date, default: Date.now }
});
const Usuario = mongoose.model('Usuario', usuarioSchema);

// Middlewares básicos
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use('/uploads', express.static('uploads'));


// NUEVA Configuración CORS corregida
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar requests OPTIONS directamente
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
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

// Endpoint de Registro
app.post('/api/registro', async (req, res) => {
  try {
    const { email, password, ciudad, empresaId } = req.body;

    // Validar datos requeridos
    if (!email || !password || !ciudad || !empresaId) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Verificar si el email ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Este email ya está registrado' });
    }

    // Verificar fortaleza de contraseña
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario (licencia inactiva por defecto)
    const nuevoUsuario = new Usuario({
      email,
      password: hashedPassword,
      ciudad,
      empresaId,
      activo: false, // Se activa manualmente después del pago
      fechaRegistro: new Date()
    });

    await nuevoUsuario.save();

    // 📢 Notificación en consola
    console.log('📢 NUEVO REGISTRO:', {
      email,
      ciudad,
      empresaId,
      activo: false
    });

    // Respuesta exitosa
    res.json({
      success: true,
      message: 'Registro completado. Te contactaremos para activar tu licencia.',
      empresaId: empresaId
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para activar licencias manualmente
app.patch('/api/usuarios/:email/activar', async (req, res) => {
  try {
    const { email } = req.params;

    const usuario = await Usuario.findOneAndUpdate(
      { email },
      { activo: true, fechaActivacion: new Date() },
      { new: true }
    );

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Licencia activada correctamente',
      usuario: {
        email: usuario.email,
        empresaId: usuario.empresaId,
        ciudad: usuario.ciudad,
        activo: usuario.activo
      }
    });

  } catch (error) {
    console.error('❌ Error activando licencia:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para ver registros pendientes
app.get('/api/registros-pendientes', async (req, res) => {
  try {
    const registrosPendientes = await Usuario.find(
      { activo: false }, 
      { password: 0 } // Excluir contraseñas
    ).sort({ fechaRegistro: -1 });

    res.json({
      success: true,
      count: registrosPendientes.length,
      registros: registrosPendientes
    });

  } catch (error) {
    console.error('❌ Error obteniendo registros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Endpoint para obtener todos los usuarios (solo para admin)
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, { password: 0 }).sort({ fechaRegistro: -1 });

    res.json({
      success: true,
      count: usuarios.length,
      usuarios: usuarios
    });

  } catch (error) {
    console.error('❌ Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
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
      login: '/login',
      registro: '/api/registro',
      activarLicencia: '/api/usuarios/:email/activar',
      registrosPendientes: '/api/registros-pendientes',
      usuarios: '/api/usuarios'
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