const mongoose = require('mongoose');
require('dotenv').config();

const Participant = require('./models/Participant');

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Find all participants without uniqueId
    const participants = await Participant.find({ uniqueId: { $exists: false } });
    
    if (participants.length === 0) {
      console.log('No participants to migrate');
      process.exit(0);
    }

    console.log(`Migrating ${participants.length} participants...`);

    for (const p of participants) {
      const uniqueId = `${p.angkatan}${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      p.uniqueId = uniqueId;
      await p.save();
      console.log(`✓ ${p.nama} - ${uniqueId}`);
    }

    console.log('Migration completed!');
    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

migrate();
