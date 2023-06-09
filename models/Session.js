const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Types = Schema.Types;

const SessionSchema = new Schema({
    chatLog: [{
        type: Types.ObjectId,
        ref: 'Chat'
    }],
});

module.exports = mongoose.model('Session', SessionSchema);
