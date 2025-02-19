const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const staffSchema = new mongoose.Schema({
    initialId: {type: Number},
    name_staff: { type: String, required: true },
    phone_staff: { type: String },
    address_staff: { type: String },
    birthday_staff: { type: String },
    gender_staff: { type: Number, default: 0 },
    cccd_staff: { type: String },
    email: { type: String, unique: true, required: true},
    password: { type: String, required: true},
    uid_facebook: { type: String },
    status: { type: String, default: 'active'},
    is_admin: { type: Number, default: 0 },
    avatar: { type: String },
    socketId: { type: String, default: ''},
    permission_bank: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'BankAccount' }],
        default: []
    },
    roles: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Role' }],
        default: []
    }
}, {
    timestamps: true,
});

staffSchema.index({ name_staff: 1 });

staffSchema.plugin(mongoosePaginate);
const Staff = mongoose.model('Staff', staffSchema);

module.exports = Staff;
