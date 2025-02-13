const mongoose = require('mongoose');

const apiCrediantails = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    secretKey: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const Crediantials = mongoose.model('apiCrediantails', apiCrediantails);

module.exports = Crediantials;
