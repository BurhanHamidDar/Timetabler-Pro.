const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjects: [{ type: String }],
  availability: [{
    day: { type: String }, 
    period: { type: Number }
  }],
  maxPeriodsPerDay: { type: Number, default: 7 }
});

module.exports = mongoose.model('Teacher', teacherSchema);
