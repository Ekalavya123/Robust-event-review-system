const mongoose = require('mongoose')
const {Schema} =mongoose;

const eventSchema= new Schema({
    eventName:{
        type: String,
        required: true
    },
    summary:{ 
        "overall":{type:Array,default:[0,0,0,0,0]},
        "Registration":{type:Array,default:[0,0,0,0,0]},
        "Event":{type:Array,default:[0,0,0,0,0]},
        "Breakfast":{type:Array,default:[0,0,0,0,0]}
    },
    date:{
        type:Date,
        default:Date.now
    }

});

module.exports = mongoose.model('event',eventSchema);