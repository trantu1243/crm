const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const tagSchema = new mongoose.Schema({
    tag: { type: String, unique: true },
    color: { type: String },
}, {
    timestamps: true,
});

tagSchema.plugin(mongoosePaginate);
const Tag = mongoose.model('Tag', tagSchema);

module.exports = Tag;
