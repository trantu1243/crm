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
            value: '',
            status: false
        }
    },
    accessToken: {
        type: {
            value: String,
            status: Boolean
        },
        default: {
            value: '',
            status: false
        }
    },
    cookie1:{
        type: {
            value: String,
            status: Boolean
        },
        default: {
            value: '',
            status: false
        }
    },
    accessToken1: {
        type: {
            value: String,
            status: Boolean
        },
        default: {
            value: '',
            status: false
        }
    },
    uuidFbs: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Customer' }],
        default: []
    },
    proxy: {
        proxy: {
            type: String,
            default: ''
        },
        proxy_auth: {
            type: String,
            default: ''
        }
    },
}, { 
    timestamps: true 
});
  
const Setting = mongoose.model('Setting', settingSchema);

module.exports = Setting;
