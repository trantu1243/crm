const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const boxTransactionSchema = new mongoose.Schema({
    initialId: {type: Number},
    name: { type: String },
    status: { 
        type: String,
        enum: ["active", "complete", "lock"],
        default: "active"
    },
    messengerId: { type: String, unique: true, required: true, index: true },
    isDeleted: { type: Boolean, default: false },
    staffId: { type: mongoose.Types.ObjectId, ref: 'Staff', index: true },
    typeBox: { type: String, default: 'facebook'},
    amount: { type: Number, default: 0 },
    notes: {
        type: [{ type: String }],
        default: []
    },
    flag: { type: Number, default: 1 },
}, {
    timestamps: true,
});

boxTransactionSchema.plugin(mongoosePaginate);
const BoxTransaction = mongoose.model('BoxTransaction', boxTransactionSchema);

module.exports = BoxTransaction;