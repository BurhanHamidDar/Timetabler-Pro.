const express = require('express');
const router = express.Router();

const teacherCtrl = require('../controllers/teacher.controller');
const subjectCtrl = require('../controllers/subject.controller');
const classCtrl = require('../controllers/class.controller');
const timetableCtrl = require('../controllers/timetable.controller');
const settingsCtrl = require('../controllers/settings.controller');
const authCtrl = require('../controllers/auth.controller');

// Auth
router.post('/login', authCtrl.login);

// Settings
router.get('/settings', settingsCtrl.getSettings);
router.put('/settings', settingsCtrl.updateSettings);

// Teachers
router.get('/teachers', teacherCtrl.getAll);
router.post('/teachers', teacherCtrl.create);
router.put('/teachers/:id', teacherCtrl.update);
router.delete('/teachers/:id', teacherCtrl.delete);

// Subjects
router.get('/subjects', subjectCtrl.getAll);
router.post('/subjects', subjectCtrl.create);
router.delete('/subjects/:id', subjectCtrl.delete);

// Classes
router.get('/classes', classCtrl.getAll);
router.post('/classes', classCtrl.create);
router.put('/classes/:id', classCtrl.update);
router.delete('/classes/:id', classCtrl.delete);

// Timetable
router.get('/timetables', timetableCtrl.getAll);
router.get('/timetable/:className', timetableCtrl.getByClass);
router.post('/timetable/generate', timetableCtrl.generateAll);
router.put('/timetable/update-cell', timetableCtrl.updateCell);

module.exports = router;
