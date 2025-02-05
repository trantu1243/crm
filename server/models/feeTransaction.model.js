const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const feeTransactionSchema = new mongoose.Schema({
    initialId: {type: Number},
    min: { type: Number },
    max: { type: Number },
    feeDefault: { type: Number },  // phí cố định
    feeFlexible: { type: Number }, // phí theo % giao dịch
    status: { type: String },
}, {
    timestamps: true,
});

feeTransactionSchema.plugin(mongoosePaginate);
const FeeTransaction = mongoose.model('FeeTransaction', feeTransactionSchema);

module.exports = FeeTransaction;
  