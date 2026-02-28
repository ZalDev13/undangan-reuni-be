const QRCode = require('qrcode');
const Participant = require('../models/Participant');

// Generate QR Code as base64
const generateQRCode = async (data) => {
  try {
    const qrCodeUrl = await QRCode.toDataURL(data);
    return qrCodeUrl;
  } catch (err) {
    console.error('Error generating QR code:', err);
    throw new Error('Gagal generate QR code');
  }
};

// @desc    Get QR code image by uniqueId
// @route   GET /api/participants/qr-image/:uniqueId
// @access  Public
const getQRImage = async (req, res) => {
  try {
    const participant = await Participant.findOne({ uniqueId: req.params.uniqueId });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Peserta tidak ditemukan'
      });
    }

    // Generate QR code if not exists
    if (!participant.qrCode) {
      const qrData = `${process.env.NGROK_URL}/undangan/${participant.uniqueId}`;
      const qrCodeImage = await generateQRCode(qrData);
      participant.qrCode = qrCodeImage;
      await participant.save();
    }

    // Extract base64 data and send as image
    const base64Data = participant.qrCode.split(',')[1];
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    res.set('Content-Type', 'image/png');
    res.set('Content-Disposition', `attachment; filename="qr-${participant.nama}.png"`);
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error getting QR image:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal generate QR code',
      error: error.message
    });
  }
};

// @desc    Create new participant
// @route   POST /api/participants
// @access  Public
const createParticipant = async (req, res) => {
  try {
    const { nama, email, nomorTelepon, kelas, angkatan, pax } = req.body;

    // Check if email already exists
    const existingParticipant = await Participant.findOne({ email });
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
    }

    // Generate unique ID for QR code
    const uniqueId = `${angkatan}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const qrData = `${process.env.NGROK_URL}/undangan/${uniqueId}`;
    const qrCodeImage = await generateQRCode(qrData);

    // Create participant
    const participant = new Participant({
      nama,
      email,
      nomorTelepon,
      kelas,
      angkatan,
      pax: pax || 1,
      uniqueId,
      qrCode: qrCodeImage
    });

    await participant.save();

    res.status(201).json({
      success: true,
      message: 'Peserta berhasil ditambahkan',
      data: {
        id: participant._id,
        nama: participant.nama,
        email: participant.email,
        nomorTelepon: participant.nomorTelepon,
        kelas: participant.kelas,
        angkatan: participant.angkatan,
        pax: participant.pax,
        uniqueId: participant.uniqueId,
        qrCode: participant.qrCode,
        statusKehadiran: participant.statusKehadiran,
        uniqueUrl: qrData
      }
    });
  } catch (error) {
    console.error('Error creating participant:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menambahkan peserta',
      error: error.message
    });
  }
};

// @desc    Get all participants
// @route   GET /api/participants
// @access  Public
const getParticipants = async (req, res) => {
  try {
    const participants = await Participant.find().sort({ tanggalDibuat: -1 });

    res.json({
      success: true,
      count: participants.length,
      data: participants.map(p => ({
        id: p._id,
        nama: p.nama,
        email: p.email,
        nomorTelepon: p.nomorTelepon,
        kelas: p.kelas,
        angkatan: p.angkatan,
        pax: p.pax,
        uniqueId: p.uniqueId,
        statusKehadiran: p.statusKehadiran,
        tanggalDibuat: p.tanggalDibuat
      }))
    });
  } catch (error) {
    console.error('Error getting participants:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data peserta',
      error: error.message
    });
  }
};

// @desc    Get participant by QR code
// @route   GET /api/participants/qr/:qrCode
// @access  Public
const getParticipantByQR = async (req, res) => {
  try {
    // Search by uniqueId, not qrCode (qrCode is base64 image)
    const participant = await Participant.findOne({ uniqueId: req.params.qrCode });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Peserta tidak ditemukan'
      });
    }

    res.json({
      success: true,
      data: {
        id: participant._id,
        nama: participant.nama,
        email: participant.email,
        kelas: participant.kelas,
        angkatan: participant.angkatan,
        pax: participant.pax,
        statusKehadiran: participant.statusKehadiran
      }
    });
  } catch (error) {
    console.error('Error getting participant by QR:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data peserta',
      error: error.message
    });
  }
};

// @desc    Update attendance status
// @route   PUT /api/participants/:id/attendance
// @access  Public
const updateAttendance = async (req, res) => {
  try {
    const { statusKehadiran } = req.body;
    
    if (!['belum_konfirmasi', 'hadir', 'tidak_hadir'].includes(statusKehadiran)) {
      return res.status(400).json({
        success: false,
        message: 'Status kehadiran tidak valid'
      });
    }

    const participant = await Participant.findByIdAndUpdate(
      req.params.id,
      { statusKehadiran },
      { new: true, runValidators: true }
    );

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Peserta tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Status kehadiran berhasil diupdate',
      data: {
        id: participant._id,
        nama: participant.nama,
        statusKehadiran: participant.statusKehadiran
      }
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat update status kehadiran',
      error: error.message
    });
  }
};

// @desc    Delete participant
// @route   DELETE /api/participants/:id
// @access  Public
const deleteParticipant = async (req, res) => {
  try {
    const participant = await Participant.findByIdAndDelete(req.params.id);

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Peserta tidak ditemukan'
      });
    }

    res.json({
      success: true,
      message: 'Peserta berhasil dihapus'
    });
  } catch (error) {
    console.error('Error deleting participant:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus peserta',
      error: error.message
    });
  }
};

// @desc    Get statistics
// @route   GET /api/participants/stats
// @access  Public
const getStats = async (req, res) => {
  try {
    const total = await Participant.countDocuments();
    const hadir = await Participant.countDocuments({ statusKehadiran: 'hadir' });
    const tidakHadir = await Participant.countDocuments({ statusKehadiran: 'tidak_hadir' });
    const belumKonfirmasi = await Participant.countDocuments({ statusKehadiran: 'belum_konfirmasi' });

    res.json({
      success: true,
      data: {
        total,
        hadir,
        tidakHadir,
        belumKonfirmasi
      }
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil statistik',
      error: error.message
    });
  }
};

module.exports = {
  createParticipant,
  getParticipants,
  getParticipantByQR,
  updateAttendance,
  deleteParticipant,
  getStats,
  getQRImage
};
