const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const quickAnswerSchema = new mongoose.Schema({
    title: { type: String },
    content: { type: String }
}, {
    timestamps: true,
});

quickAnswerSchema.plugin(mongoosePaginate);
const QuickAnswer = mongoose.model('QuickAnswer', quickAnswerSchema);

module.exports = QuickAnswer;
  