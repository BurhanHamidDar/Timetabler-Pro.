const Timetable = require('../models/Timetable');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const { generate } = require('../scheduler/generator');

exports.getByClass = async (req, res) => {
  try {
    const timetable = await Timetable.findOne({ className: req.params.className }).sort('-version');
    res.json(timetable || { schedule: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.generateAll = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    const classes = await Class.find();
    
    // Run backtracking algorithm
    const timetables = generate(teachers, classes);
    
    // Overwrite existing for now (or increment version)
    await Timetable.deleteMany({});
    const inserted = await Timetable.insertMany(timetables);
    res.json({ success: true, timetables: inserted });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const timetables = await Timetable.find();
    res.json(timetables);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCell = async (req, res) => {
  const { className, day, period, subject, teacher } = req.body;
  
  try {
    let timetable = await Timetable.findOne({ className });
    if (!timetable) {
      timetable = new Timetable({ className, version: 1, schedule: [] });
    }

    if (subject && teacher) {
      // Constraint Validation
      const allTimetables = await Timetable.find();
      let teacherPeriodsToday = 0;

      for (const t of allTimetables) {
        for (const cell of t.schedule) {
          if (cell.teacher === teacher && cell.day === day) {
            
            // Check double booking across different classes
            if (cell.period === period && t.className !== className) {
              return res.status(400).json({ error: `Constraint Broken: ${teacher} is already teaching class ${t.className} on ${day} period ${period}.` });
            }

            // Count periods per day
            if (t.className !== className || cell.period !== period) {
               teacherPeriodsToday++;
            }
          }
        }
      }

      const teacherDoc = await Teacher.findOne({ name: teacher });
      const maxLimit = teacherDoc ? teacherDoc.maxPeriodsPerDay : 7;
      
      const existingCell = timetable.schedule.find(c => c.day === day && c.period === period);
      // Only check limit if we are adding a NEW slot for this teacher (not just changing subject of same teacher)
      if (!existingCell || existingCell.teacher !== teacher) {
        if (teacherPeriodsToday >= maxLimit) {
          return res.status(400).json({ error: `Constraint Broken: ${teacher} has reached their daily limit of ${maxLimit} periods on ${day}.` });
        }
      }
    }

    // Remove the old cell at this slot
    timetable.schedule = timetable.schedule.filter(c => !(c.day === day && c.period === period));

    // Inject the new assignment
    if (subject && teacher) {
      timetable.schedule.push({ day, period, subject, teacher, locked: true });
    }
    
    await timetable.save();
    res.json({ success: true, schedule: timetable.schedule });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
