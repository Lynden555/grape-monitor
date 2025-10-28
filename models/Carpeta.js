const mongoose = require('mongoose');

const carpetaSchema = new mongoose.Schema({
  nombre: String,
  tipo: { type: String, enum: ['root', 'folder'], default: 'folder' },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carpeta', default: null },
  empresaId: String,
  ciudad: String,
  usuarioId: String,
  fechaCreacion: { type: Date, default: Date.now }
});

const asignacionCarpetaSchema = new mongoose.Schema({
  empresaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Empresa' },
  carpetaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Carpeta' },
  empresaPadreId: String,
  ciudad: String
});

const Carpeta = mongoose.model('Carpeta', carpetaSchema);
const AsignacionCarpeta = mongoose.model('AsignacionCarpeta', asignacionCarpetaSchema);

module.exports = { Carpeta, AsignacionCarpeta };