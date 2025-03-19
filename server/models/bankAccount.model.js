const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const bankAccountSchema = new mongoose.Schema({
    initialId: { type: Number },
    bankName: { type: String, index: true },
    bankCode: { type: String },
    bankAccount: { type: String },
    bankAccountName: { type: String },
    createdBy: { type: String },
    binBank: { type: String },
    name: { type: String },
    logo: { type: String },
    qrImage: {type: String},
    totalAmount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
}, {
    timestamps: true,
});

bankAccountSchema.index({ bankCode: 1, isDeleted: 1 });

bankAccountSchema.plugin(mongoosePaginate);
const BankAccount = mongoose.model('BankAccount', bankAccountSchema);

module.exports = BankAccount;