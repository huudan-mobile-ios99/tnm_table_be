const mongoose = require('mongoose');
const moment = require('moment-timezone');

const SettingsSchema = new mongoose.Schema({
    id: {
        type: String, unique: true
    },
    round: {
        type: Number,
        required: true,
    },
    game: {
        type: Number,
        required: true,
    },
    note: {
        type: String,
        default:"",
    },

    createdAt: {
        type: Date,
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
    },
    updateAt: {
        type: Date,
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
    },
});


const Settings = mongoose.model('settings', SettingsSchema);
module.exports = Settings;
