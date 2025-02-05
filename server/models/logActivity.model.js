const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const logActivitySchema = new mongoose.Schema({
    initialId: {type: Number},
    staffId: { type: mongoose.Types.ObjectId, ref: 'Staff', index: true },
    action: { type: String },
    idTarget: { type: String, index: true },
    idBox: { type: String, index: true },
    description: { type: String },
    ip: { type: String },
}, {
    timestamps: true,
});
  
logActivitySchema.plugin(mongoosePaginate);
const LogActivity = mongoose.model('LogActivity', logActivitySchema);

module.exports = LogActivity;