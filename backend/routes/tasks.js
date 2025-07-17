const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const SECRET = process.env.JWT_SECRET || 'devsecret';
const ActionLog = require('../models/ActionLog');
const { io } = require('../bin/www');

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

// Get all tasks
router.get('/', auth, async (req, res) => {
  const tasks = await Task.find().populate('assignedTo', 'username');
  res.json(tasks);
});

// Create task
router.post('/', auth, async (req, res) => {
  const { title, description, assignedTo, status, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });
  if (["Todo", "In Progress", "Done"].includes(title)) return res.status(400).json({ error: 'Title cannot match column names' });
  const board = req.body.board || 'default';
  const exists = await Task.findOne({ title, board });
  if (exists) return res.status(409).json({ error: 'Title must be unique per board' });
  const task = new Task({ title, description, assignedTo, status, priority, board });
  await task.save();
  await ActionLog.create({ action: 'add', user: req.user.id, task: task._id, details: `Created task '${title}'` });
  io.emit('task:add', task);
  res.status(201).json(task);
});

// Update task with conflict handling
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  // Conflict handling: require client to send __v (version)
  if (typeof updates.__v !== 'number') return res.status(400).json({ error: 'Missing version for conflict check' });
  const task = await Task.findOne({ _id: id });
  if (!task) return res.status(404).json({ error: 'Task not found' });
  if (task.__v !== updates.__v) {
    return res.status(409).json({ error: 'Conflict', serverTask: task });
  }
  // Apply updates and increment version
  Object.assign(task, updates);
  task.__v++;
  await task.save();
  await ActionLog.create({ action: 'edit', user: req.user.id, task: id, details: `Edited task '${task.title}'` });
  io.emit('task:edit', task);
  res.json(task);
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  await Task.findByIdAndDelete(id);
  await ActionLog.create({ action: 'delete', user: req.user.id, task: id, details: `Deleted task` });
  io.emit('task:delete', { id });
  res.json({ message: 'Task deleted' });
});

// Smart Assign
router.post('/:id/smart-assign', auth, async (req, res) => {
  const { id } = req.params;
  // Find all users and count their active (not Done) tasks
  const users = await User.find();
  const counts = await Promise.all(users.map(async user => {
    const count = await Task.countDocuments({ assignedTo: user._id, status: { $ne: 'Done' } });
    return { user, count };
  }));
  const min = Math.min(...counts.map(c => c.count));
  const candidates = counts.filter(c => c.count === min).map(c => c.user);
  // Pick the first candidate (could randomize)
  const assignedUser = candidates[0];
  const task = await Task.findByIdAndUpdate(id, { assignedTo: assignedUser._id }, { new: true });
  await ActionLog.create({ action: 'assign', user: req.user.id, task: id, details: `Smart assigned to ${assignedUser.username}` });
  io.emit('task:edit', task);
  res.json(task);
});

module.exports = router; 