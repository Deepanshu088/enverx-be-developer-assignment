const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true, minLenght: 5 },
    creator: { type: mongoose.Types.ObjectId, required: true, ref: 'User', immutable: true },
    category: { type: [String], default: ["all"] }
}, {
    timestamps: true
})


module.exports = mongoose.model('Post', postSchema);