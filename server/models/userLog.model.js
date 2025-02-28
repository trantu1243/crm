const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const userLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Types.ObjectId, ref: 'Staff', required: true },
    targetId: { type: mongoose.Types.ObjectId },
    action: { type: String, required: true },
    details: { type: Object },
    ipAddress: { type: String },
    userAgent: { type: String },
    createdAt: { type: Date, default: Date.now }
});
  
userLogSchema.plugin(mongoosePaginate);
const UserLog = mongoose.model('UserLog', userLogSchema);

module.exports = UserLog;