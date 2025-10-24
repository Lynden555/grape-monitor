const mongoose = require('mongoose');

const impresoraLatestSchema = new mongoose.Schema({
  printerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Impresora', 
    unique: true 
  },
  ultimoCorteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'CortesMensuales', 
    default: null 
  },
  lastCutDate: { type: Date, default: null },
  lastPageCount: { type: Number, default: null },
  lastPageMono: { type: Number, default: null },
  lastPageColor: { type: Number, default: null },
  lastSupplies: [{
    name: String,
    level: Number,
    max: Number
  }],
  lastSeenAt: { type: Date, default: null },
  lowToner: { type: Boolean, default: false },
  online: { type: Boolean, default: true }
}, { strict: true });

module.exports = mongoose.model('ImpresoraLatest', impresoraLatestSchema);