const express = require('express');
const router = express.Router();
const {
  createParticipant,
  getParticipants,
  getParticipantByQR,
  updateAttendance,
  deleteParticipant,
  getStats,
  getQRImage
} = require('../controllers/participantController');

// Participant routes
router.post('/', createParticipant);
router.get('/', getParticipants);
router.get('/stats', getStats);
router.get('/qr-image/:uniqueId', getQRImage);
router.get('/qr/:qrCode', getParticipantByQR);
router.put('/:id/attendance', updateAttendance);
router.delete('/:id', deleteParticipant);

module.exports = router;
