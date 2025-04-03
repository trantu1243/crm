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
}, {
    timestamps: true,
});

customerSchema.plugin(mongoosePaginate);
const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;
  