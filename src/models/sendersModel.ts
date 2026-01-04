const mongoose = require('mongoose');

const senderSchema = new mongoose.Schema({
    senderName: {
        type: String,
        required: true,
    },
    senderEmail: {
        type: String,
        required: true,
    },
});

const sendersModel = mongoose.model('Sender', senderSchema);

module.exports = sendersModel;