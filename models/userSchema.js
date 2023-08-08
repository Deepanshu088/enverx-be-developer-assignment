const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, requied: true, unique: true, immutable: true },
    password: { type: String, required: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);