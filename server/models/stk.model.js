const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const stkSchema = new mongoose.Schema({
    bankId: { type: mongoose.Types.ObjectId, ref: 'BankApi' },
    stk: { type: String },
}, {
    timestamps: true,
});

stkSchema.plugin(mongoosePaginate);
const Stk = mongoose.model('Stk', stkSchema);

module.exports = Stk;
  