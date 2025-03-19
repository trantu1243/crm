const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const bankApiSchema = new mongoose.Schema({
    initialId: {type: Number},
    bankName: { type: String },
    bankCode: { type: String },
    binBank: { type: String },
    logo: { type: String },
    name: { type: String }
}, {
    timestamps: true,
});

bankApiSchema.index({ bankCode: 1 });

bankApiSchema.plugin(mongoosePaginate);
const BankApi = mongoose.model('BankApi', bankApiSchema);

module.exports = BankApi;