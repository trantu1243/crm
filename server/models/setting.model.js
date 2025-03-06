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
    },
    lockBox: {
        type: {
            numOfDay: Number,
            isOn: Boolean
        },
        default: {
            numOfDay: 0,
            isOn: false
        }
    },
    cookie:{
        type: {
            value: String,
            status: Boolean
        },
        default: {
            numOfDay: 0,
            isOn: false
        }
    },
    accessToken: {
        type: {
            value: String,
            status: Boolean
        },
        default: {
            numOfDay: 0,
            isOn: false
        }
    },
    uuidFbs: {
        type: [String],
        default: []
    },
}, { 
    timestamps: true 
});
  
const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
