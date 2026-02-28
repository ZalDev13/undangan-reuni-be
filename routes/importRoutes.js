const express = require('express');
const router = express.Router();
const { upload, importParticipants } = require('../controllers/importController');

router.post('/import', upload.single('file'), importParticipants);

module.exports = router;
