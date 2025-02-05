const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const permissionSchema = new mongoose.Schema({
    initialId: {type: Number},
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    status: { type: String, required: true },
}, { 
    timestamps: true 
});

permissionSchema.plugin(mongoosePaginate);
const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;

