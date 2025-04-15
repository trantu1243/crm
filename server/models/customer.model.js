const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const customerSchema = new mongoose.Schema({
    nameCustomer: { type: String },
    facebookId: { type: String, unique: true },
    avatar: { type: String },
    username: { type: String, unique: true },
    bankAccounts: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Stk' }],
        default: []
    },
    tags:{
        type: [{ type: mongoose.Types.ObjectId, ref: 'Tag' }],
        default: []
    },
    buyerCount: { 
        success: { type: Number, default: 0 },
        cancel: { type: Number, default: 0 },
    },
    sellerCount: {
        success: { type: Number, default: 0 },
        cancel: { type: Number, default: 0 },
    },
    whiteList: { type: Boolean, default: false },
    blackList: { type: Boolean, default: false },
    note: { type: String, default: '' },
}, {
    timestamps: true,
});

customerSchema.plugin(mongoosePaginate);

const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
  