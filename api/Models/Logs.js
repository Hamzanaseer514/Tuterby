// ...existing code...
const mongoose = require('mongoose');
const { Schema } = mongoose;

const LogSchema = new Schema({
  changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: false },
  changedAt: { type: Date, default: Date.now },
  table: { type: String, required: true },
  action: { type: String, enum: ['create', 'update', 'delete'], required: true },
  documentKey: { type: Schema.Types.Mixed },
  actualJson: { type: Schema.Types.Mixed }, // the BEFORE state
  meta: { type: Schema.Types.Mixed }
}, { versionKey: false, timestamps: { createdAt: 'loggedAt', updatedAt: false } }
);

module.exports = mongoose.model('ChangeLog', LogSchema);
// ...existing code...