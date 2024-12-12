const mongoose = require('mongoose');

const questionsSchema = new mongoose.Schema(
  {
    sno: { type: Number}, // Serial Number
    questions: { type: String},         // Question Text
    attachment: { type: String },                        // URL or Path to Attachment
    // status: { type: String, enum: ['pending', 'answered', 'closed'], default: 'pending' }, // Status of Question
    status: { type: String, default: 'Pending' },
    addedBy: { type: String},           // Name or ID of User Who Added It
    date: { type: Date},                // Date Question Was Added
    time: { type: String},              // Time Question Was Added (e.g., "HH:MM AM/PM")
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

module.exports = mongoose.model('Question', questionsSchema);
