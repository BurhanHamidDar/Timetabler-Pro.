const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();

app.use(cors());
app.use(express.json());

const Admin = require('./models/Admin');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/timetabler')
  .then(async () => {
    console.log('MongoDB Connected');
    const exist = await Admin.findOne({ username: 'hilal101' });
    if (!exist) {
      await Admin.create({ username: 'hilal101', password: 'hilal@sir' });
      console.log('Default master admin account securely provisioned.');
    }
  })
  .catch(err => console.error(err));

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
