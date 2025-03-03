const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    uniqueId: {type: Number, unique: true},
    fee: { 
        type: {
            amount: Number,
            isOn: Boolean
        },
        default: {
            amount: 0,
            isOn: false
        }
    }
}, { 
    timestamps: true 
});
  
const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
