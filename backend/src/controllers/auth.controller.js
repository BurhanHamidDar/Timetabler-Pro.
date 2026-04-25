const Admin = require('../models/Admin');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials. Please check your username.' });
    }

    // Direct password check since this is a hardcoded single-admin system
    // For enterprise scaling, this would be updated to bcrypt.compare
    if (admin.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
    }

    // Standard hardcoded token format for single-user localized app
    const token = Buffer.from(`${admin._id}-auth-token-${Date.now()}`).toString('base64');
    
    return res.status(200).json({
      message: 'Authentication successful',
      token,
      user: {
        username: admin.username,
        role: 'Administrator'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during authentication' });
  }
};
