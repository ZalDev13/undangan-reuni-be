const multer = require('multer');
const xlsx = require('xlsx');
const QRCode = require('qrcode');
const Participant = require('../models/Participant');

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /xlsx|xls|csv/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file Excel (.xlsx, .xls) atau CSV yang diperbolehkan'));
    }
  }
});

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

// @desc    Bulk import participants from Excel/CSV
// @route   POST /api/participants/import
// @access  Public
const importParticipants = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Tidak ada file yang diupload'
      });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    if (data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'File Excel kosong'
      });
    }

    const results = {
      success: [],
      failed: [],
      duplicate: []
    };

    // Process each row
    for (const row of data) {
      try {
        // Map Excel columns to expected fields
        const participantData = {
          nama: row.Nama || row.nama,
          email: row.Email || row.email,
          nomorTelepon: row['Nomor Telepon'] || row.nomorTelepon || row.NoTelp || row.notelp,
          kelas: row.Kelas || row.kelas,
          angkatan: row.Angkatan || row.angkatan,
          pax: row.Pax || row.pax || 1
        };

        // Validate required fields
        if (!participantData.nama || !participantData.email) {
          results.failed.push({
            data: row,
            error: 'Nama dan email wajib diisi'
          });
          continue;
        }

        // Check duplicate email
        const existingParticipant = await Participant.findOne({ 
          email: participantData.email.toLowerCase() 
        });
        
        if (existingParticipant) {
          results.duplicate.push({
            data: row,
            error: 'Email sudah terdaftar'
          });
          continue;
        }

        // Generate unique ID and QR code
        const uniqueId = `${participantData.angkatan}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
        const qrData = `${process.env.NGROK_URL}/undangan/${uniqueId}`;
        const qrCodeImage = await generateQRCode(qrData);

        // Create participant
        const participant = new Participant({
          ...participantData,
          email: participantData.email.toLowerCase(),
          qrCode: qrCodeImage
        });

        await participant.save();

        results.success.push({
          ...participantData,
          uniqueUrl: qrData
        });

      } catch (error) {
        results.failed.push({
          data: row,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Import selesai',
      summary: {
        total: data.length,
        success: results.success.length,
        duplicate: results.duplicate.length,
        failed: results.failed.length
      },
      data: results
    });

  } catch (error) {
    console.error('Error importing participants:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengimport data',
      error: error.message
    });
  }
};

module.exports = {
  upload,
  importParticipants
};
