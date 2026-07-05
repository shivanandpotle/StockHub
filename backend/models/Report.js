const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reportType: {
    type: String,
    enum: ['inventory-summary', 'monthly', 'yearly', 'low-stock'],
  },
  fileUrl: {
    type: String,
  },
  generatedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Report', reportSchema);
