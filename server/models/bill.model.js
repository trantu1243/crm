const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const billSchema = new mongoose.Schema({
    initialId: {type: Number},
    bankCode: { type: String },
    stk: { type: String },
    content: { type: String },
    amount: { type: Number },
    bonus: { type: Number, default: 0 },
    typeTransfer: { type: String },
    boxId: { type: mongoose.Types.ObjectId, ref: 'BoxTransaction', index: true },
    linkQr: { type: String },
    status: { type: Number, default: 1 },
    staffId: { type: mongoose.Types.ObjectId, ref: 'Staff', index: true },
    isCompleted: { type: Boolean, default: false },
    billId: { type: mongoose.Types.ObjectId, ref: 'Bill' }
}, {
    timestamps: true,
});

billSchema.index({ thanhKhoanId: 1 });
billSchema.index({ billGdtgId: 1 });

billSchema.plugin(mongoosePaginate);
const Bill = mongoose.model('Bill', billSchema);

module.exports = Bill;
  