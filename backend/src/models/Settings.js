const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  singletonKey: { type: String, default: 'GLOBAL_SETTINGS', unique: true },
  schoolStartTime: { type: String, default: '08:00' },
  periodDuration: { type: Number, default: 45 },
  lunchAfterPeriod: { type: Number, default: 4 },
  lunchDuration: { type: Number, default: 30 }
});

module.exports = mongoose.model('Settings', settingsSchema);
