const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  nama: {
    type: String,
    required: [true, 'Nama wajib diisi'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email wajib diisi'],
    unique: true,
    lowercase: true,
    trim: true
  },
  nomorTelepon: {
    type: String,
    required: [true, 'Nomor telepon wajib diisi'],
    trim: true
  },
  kelas: {
    type: String,
    required: [true, 'Kelas wajib diisi'],
    trim: true
  },
  angkatan: {
    type: Number,
    required: [true, 'Angkatan wajib diisi']
  },
  pax: {
    type: Number,
    default: 1,
    min: 1
  },
  uniqueId: {
    type: String,
    unique: true
  },
  qrCode: {
    type: String
  },
  statusKehadiran: {
    type: String,
    enum: ['belum_konfirmasi', 'hadir', 'tidak_hadir'],
    default: 'belum_konfirmasi'
  },
  tanggalDibuat: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Participant', participantSchema);
