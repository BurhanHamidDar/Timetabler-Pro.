const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  className: { type: String, required: true },
  version: { type: Number, default: 1 },
  schedule: [{
    day: { type: String },
    period: { type: Number },
    subject: { type: String },
    teacher: { type: String },
    locked: { type: Boolean, default: false }
  }]
});

module.exports = mongoose.model('Timetable', timetableSchema);
