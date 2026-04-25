const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  subjects: [{
    subject: { type: String, required: true },
    periodsPerWeek: { type: Number, required: true }
  }]
});

module.exports = mongoose.model('Class', classSchema);
