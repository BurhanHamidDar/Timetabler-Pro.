const mongoose = require('mongoose');
require('dotenv').config();
const Teacher = require('./src/models/Teacher');
const Subject = require('./src/models/Subject');
const Class = require('./src/models/Class');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/timetabler');

const run = async () => {
  await Teacher.deleteMany();
  await Subject.deleteMany();
  await Class.deleteMany();

  const subjectsData = ["Math", "Science", "English", "History", "Art"];
  for (const name of subjectsData) {
     await Subject.create({ name });
  }

  await Teacher.insertMany([
    { name: "Mr. Smith", subjects: ["Math", "Science"], maxPeriodsPerDay: 4 },
    { name: "Mrs. Jones", subjects: ["English"], maxPeriodsPerDay: 5 },
    { name: "Mr. Davis", subjects: ["History"], maxPeriodsPerDay: 4 },
    { name: "Ms. Wilson", subjects: ["Art", "History"], maxPeriodsPerDay: 3 },
    { name: "Mr. Taylor", subjects: ["Math", "English"], maxPeriodsPerDay: 5 }
  ]);

  await Class.insertMany([
    { name: "10A", subjects: [
      { subject: "Math", periodsPerWeek: 5 },
      { subject: "Science", periodsPerWeek: 4 },
      { subject: "English", periodsPerWeek: 4 },
      { subject: "History", periodsPerWeek: 3 },
      { subject: "Art", periodsPerWeek: 2 }
    ]},
    { name: "10B", subjects: [
      { subject: "Math", periodsPerWeek: 4 },
      { subject: "Science", periodsPerWeek: 5 },
      { subject: "English", periodsPerWeek: 4 },
      { subject: "History", periodsPerWeek: 3 },
      { subject: "Art", periodsPerWeek: 2 }
    ]},
    { name: "10C", subjects: [
      { subject: "Math", periodsPerWeek: 4 },
      { subject: "Science", periodsPerWeek: 4 },
      { subject: "English", periodsPerWeek: 5 },
      { subject: "History", periodsPerWeek: 3 },
      { subject: "Art", periodsPerWeek: 2 }
    ]}
  ]);

  console.log("Seeded database successfully.");
  process.exit();
};

run();
