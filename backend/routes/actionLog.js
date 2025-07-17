const express = require('express');
const router = express.Router();
const ActionLog = require('../models/ActionLog');
const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'devsecret';

// Auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// Get last 20 actions
router.get('/', auth, async (req, res) => {
  const actions = await ActionLog.find().sort({ createdAt: -1 }).limit(20);
  res.json(actions);
});

module.exports = router; 