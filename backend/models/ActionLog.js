const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. add, edit, delete, assign, drag-drop
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  task: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
  details: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

module.exports = mongoose.model('ActionLog', actionLogSchema); 