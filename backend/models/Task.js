const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true }, // TODO: unique per board
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['Todo', 'In Progress', 'Done'], default: 'Todo' },
  priority: { type: Number, default: 1 },
  board: { type: String, default: 'default' },
});

taskSchema.index({ title: 1, board: 1 }, { unique: true });

module.exports = mongoose.model('Task', taskSchema); 