const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7];

function shuffle(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

exports.generate = (teachers, classes) => {
  const tasks = [];
  const dailyLimits = {};

  for (const cls of classes) {
    dailyLimits[cls.name] = {};
    for (const classSub of cls.subjects) {
      // e.g. 5 periods per week -> max 1 per day. 8 periods per week -> max 2 per day.
      dailyLimits[cls.name][classSub.subject] = Math.ceil(classSub.periodsPerWeek / DAYS.length);
      
      for (let i = 0; i < classSub.periodsPerWeek; i++) {
        tasks.push({
          className: cls.name,
          subject: classSub.subject
        });
      }
    }
  }

  // Shuffle tasks to prevent deterministic bottleneck failures
  const shuffledTasks = shuffle(tasks);

  const subjectTeachers = {};
  for (const t of teachers) {
    for (const s of t.subjects) {
      if (!subjectTeachers[s]) subjectTeachers[s] = [];
      subjectTeachers[s].push(t);
    }
  }

  const assignments = [];
  let timeout = false;
  const startTime = Date.now();
  const MAX_TIME_MS = 10000;

  const isSafe = (task, day, period, teacher) => {
    let tDayCount = 0;
    let classSubjectDayCount = 0;

    for (const a of assignments) {
      if (a.className === task.className && a.day === day && a.period === period) return false;
      if (a.teacher === teacher.name && a.day === day && a.period === period) return false;

      if (a.className === task.className && a.day === day && a.subject === task.subject) {
        classSubjectDayCount++;
      }

      if (a.teacher === teacher.name && a.day === day) {
        tDayCount++;
      }
    }

    if (tDayCount >= teacher.maxPeriodsPerDay) return false;

    const limit = dailyLimits[task.className][task.subject] || 1;
    if (classSubjectDayCount >= limit) return false;

    return true;
  };

  const solve = (taskIndex) => {
    if (Date.now() - startTime > MAX_TIME_MS) {
      timeout = true;
      return false;
    }
    
    if (taskIndex >= shuffledTasks.length) return true;

    const task = shuffledTasks[taskIndex];
    let candidates = subjectTeachers[task.subject] || [];
    
    // Attempt standard heuristic random assignment
    for (const day of shuffle(DAYS)) {
      for (const period of shuffle(PERIODS)) {
        for (const teacher of shuffle(candidates)) {
          if (isSafe(task, day, period, teacher)) {
            assignments.push({ className: task.className, subject: task.subject, teacher: teacher.name, day, period });
            if (solve(taskIndex + 1)) return true;
            assignments.pop();
          }
        }
      }
    }

    return false;
  };

  const success = solve(0);

  if (timeout) {
    throw new Error("Generation timed out. The mathematical constraints are too tight (too many required periods vs available teachers).");
  }

  if (!success) {
    throw new Error("Could not generate a conflict-free timetable. Ensure you have enough teachers assigned to required subjects.");
  }

  const timetablesMap = {};
  for (const a of assignments) {
    if (!timetablesMap[a.className]) {
      timetablesMap[a.className] = { className: a.className, version: 1, schedule: [] };
    }
    timetablesMap[a.className].schedule.push({
      day: a.day, period: a.period, subject: a.subject, teacher: a.teacher, locked: false
    });
  }

  return Object.values(timetablesMap);
};
