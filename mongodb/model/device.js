const mongoose = require('mongoose')
// const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment-timezone')

const DeviceSchema = new mongoose.Schema({

    deviceId:{
        required:true,
        type:String,
    },
    deviceName:{
        required :true,
        type: String,
    },
    deviceInfo:{
        type:String,
        default: "device info"
    },
    createdAt: {
        default: () => moment().tz("Asia/Bangkok").toLocaleString('en-US', {
            timeZone: 'Asia/Bangkok'
        }),
        required:true,type:Date,
    },
    ipAddress: {
        required: true,
        type:String,
        default:""
    },
    userAgent:{
        required: true,
        type:String,
        default:"",
    },
    platform:{
        required:true,
        type:String,
        default:"",
    }


})

const Member = mongoose.model("devices", DeviceSchema);
module.exports = Member;
