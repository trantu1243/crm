const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const tagSchema = new mongoose.Schema({
    slug: { type: String, unique: true },
    name: { type: String },
    color: { 
        type: String,
        enum: ["primary", "secondary", "success", "info", "warning", "danger", "focus", "alternate", "dark"],
        default: "primary"
    },
}, {
    timestamps: true,
});

tagSchema.plugin(mongoosePaginate);
const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
