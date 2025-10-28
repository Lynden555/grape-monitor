const mongoose = require('mongoose');

const empresaSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true },
  empresaId: { type: String, required: true },
  ciudad: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

empresaSchema.index({ empresaId: 1, ciudad: 1, createdAt: -1 });

module.exports = mongoose.model('Empresa', empresaSchema);

const carpetaSchema = new mongoose.Schema({
  nombre: String,
  tipo: { type: String, enum: ['root', 'folder'], default: 'folder' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carpeta', default: null },
  empresaId: String, // Para separar carpetas por empresa
  ciudad: String,
  usuarioId: String, // Si quieres carpetas por usuario
  fechaCreacion: { type: Date, default: Date.now }
});

const asignacionCarpetaSchema = new mongoose.Schema({
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  carpetaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carpeta' },
  empresaPadreId: String, // El empresaId del usuario
  ciudad: String
});

const Carpeta = mongoose.model('Carpeta', carpetaSchema);
const AsignacionCarpeta = mongoose.model('AsignacionCarpeta', asignacionCarpetaSchema);

module.exports = { Carpeta, AsignacionCarpeta };