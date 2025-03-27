const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const cookieSchema = new mongoose.Schema({
    uniqueId: {
        type: Number,
        unique: true
    },
    cookie: {
        type: String,
        default: ''
    },
    token: {
        type: String,
        default: ''
    },
    proxy: {
        type: String,
        default: ''
    },
    proxy_auth: {
        type: String,
        default: ''
    }
}, {
    timestamps: true,
});

cookieSchema.plugin(mongoosePaginate);
const Cookie = mongoose.model('Cookie', cookieSchema);

module.exports = Cookie;
  