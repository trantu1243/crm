const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const roleSchema = new mongoose.Schema({
    initialId: {type: Number},
    name: { type: String, required: false },
    slug: { type: String, required: false, unique: true },
    status: { type: String, required: false },
    permissions: {
        type: [{ type: mongoose.Types.ObjectId, ref: 'Permission' }],
        default: []
    },
}, { 
    timestamps: true 
});
  
roleSchema.plugin(mongoosePaginate);
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;
