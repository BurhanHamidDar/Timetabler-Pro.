const Settings = require('../models/Settings');

exports.getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ singletonKey: 'GLOBAL_SETTINGS' });
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  const { schoolStartTime, periodDuration, lunchAfterPeriod, lunchDuration } = req.body;
  try {
    let settings = await Settings.findOne({ singletonKey: 'GLOBAL_SETTINGS' });
    if (!settings) settings = new Settings({});
    
    settings.schoolStartTime = schoolStartTime || settings.schoolStartTime;
    settings.periodDuration = periodDuration || settings.periodDuration;
    
    if (lunchAfterPeriod !== undefined) settings.lunchAfterPeriod = lunchAfterPeriod;
    if (lunchDuration !== undefined) settings.lunchDuration = lunchDuration;
    
    await settings.save();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
