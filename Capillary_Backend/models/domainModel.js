const mongoose = require('mongoose');

const domainsSchema = new mongoose.Schema(
  {
    sno: { type: Number }, // Serial Number
    domain: { type: String,  }, // Domain Name
    entity: { type: String, }, // Related Entity Name or ID
    status: { type: String, default: 'Active' }, // Domain Status (e.g., Active, Inactive)
    date: { type: Date }, // Date When the Domain Was Added
    time: { type: String }, // Time When the Domain Was Added (e.g., "HH:MM AM/PM")
  },
  { timestamps: true } // Automatically adds `createdAt` and `updatedAt` fields
);

module.exports = mongoose.model('Domain', domainsSchema);
