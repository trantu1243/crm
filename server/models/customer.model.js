const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const customerSchema = new mongoose.Schema({
    initialId: {type: Number},
    nameCustomer: { type: String },
    facebookId: { type: String },
    isDeleted: { type: Boolean, default: false },
    boxId: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'BoxTransaction', index: true }],
        default: []
    }, 
    type: { type: String },
    bankAccounts: {
        type: [{
            bankCode: String,
            stk: String,
        }],
        default: []
    }
}, {
    timestamps: true,
});

customerSchema.plugin(mongoosePaginate);
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
  