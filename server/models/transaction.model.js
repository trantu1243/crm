const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const transactionSchema = new mongoose.Schema({
    initialId: {type: Number},
    boxId: { type: mongoose.Types.ObjectId, ref: 'BoxTransaction', index: true },
    bankId: { type: mongoose.Types.ObjectId, ref: 'BankAccount' },
    amount: { type: Number },
    stk: { type: String },
    content: { type: String },
    fee: { type: Number },
    totalAmount: { type: Number },
    status: { type: Number, default: 1 },
    linkQr: { type: String },
    messengerId: { type: String },
    staffId: { 
        type: mongoose.Types.ObjectId, ref: 'Staff',
        required: true
    },
    typeFee: { 
        type: String,
        enum: ["buyer", "seller", "split", "free"],
        required: true
    },
    bonus: { type: Number, default: 0 },
    flags: { type: Number, default: 1 },
    decodeQr: { type: String },
}, {
    timestamps: true,
});

transactionSchema.index({ box_transaction_id: 1 });
transactionSchema.index({ staff_id: 1 });
transactionSchema.index({ messenger_id: 1 });
transactionSchema.index({ bill_gdtg_id: 1 });

transactionSchema.plugin(mongoosePaginate);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;

// 1 chua nhan
// 2 thanh cong
// 3 huy
// 6 da nhan
// 7 dang xu ly
// 8 hoan thanh 1 phan
  