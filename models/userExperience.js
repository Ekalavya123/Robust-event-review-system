const mongoose = require('mongoose')
const {Schema} =mongoose;

const userExperienceSchema= new Schema({
    eventName:{
        type: String,
        required: true
    },
    email:{type:String,required:true},
    review:{
        "Registration":{type:String,default:"NA"},
        "Event":{type:String,default:"NA"},
        "Breakfast":{type:String,default:"NA"}
    },
    rating:{
        "Registration":{type:Number,required:true},
        "Event":{type:Number,required:true},
        "Breakfast":{type:Number,required:true}
    },
    overall:{type:Number,required:true},
    likes:{type:Number,default:0 },
    reports:{type:Number,default:0},
    reply:{type:String,default:""},
    flag:{type:Boolean,default:0},
    date:{
        type:Date,
        default:Date.now
    }

});

module.exports = mongoose.model('userExperience',userExperienceSchema);