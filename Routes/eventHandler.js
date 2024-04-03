const express = require('express')
const router = express.Router()
const User=require("../models/User")
const eventData=require("../models/event")
const userExperience=require("../models/userExperience")
require('dotenv').config()


function validateEmail(email) {
    var regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    return regex.test(email);
}

router.post("/createEvent", async(req,res)=> {
    try{
        eventData.create({
            eventName: req.body.eventName
        })
        res.status(200).json({success:true,message:"event Created Successfully"});
    }
    catch(error){
        console.log(error)
        res.status(404).json({success:false,message:"Something went wring try again later"});
    }
})

router.put("/:event/addReview", async(req,res)=> {
    //inputs validating
    let errors = validateEmail(req.body.email);
    let event=req.params.event
    if (!errors) return res.json({success:false,message:"Invalid Emial"});
    errors=await eventData.findOne({"eventName":event});
    if (!errors) return res.json({success:false,message:"event not exist"});
    let email=req.body.email
    let fool=await User.findOne({'email':email})
    if (fool==null) return res.status(404).json({success:false,message:"not a valid user"});


    let eventSummary=await eventData.findOne({eventName:event});
    //console.log("eventsummary",eventSummary)
    try{
        let prevData=await userExperience.findOne({'email':req.body.email,eventName:event});
        if(prevData!=null){
            await userExperience.updateOne({ email:req.body.email,eventName:event}, {$set:{
                eventName: event,
                email:req.body.email,
                review:{
                    Registration:req.body.review.Registration,
                    Event:req.body.review.Event,
                    Breakfast:req.body.review.Breakfast
                },
                rating:{
                    Registration:req.body.rating.Registration,
                    Event:req.body.rating.Event,
                    Breakfast:req.body.rating.Breakfast
                },
                overall:req.body.overall
            }});
            eventSummary.summary.Registration[prevData.rating.Registration-1]--;
            eventSummary.summary.Registration[req.body.rating.Registration-1]++;
            eventSummary.summary.Event[prevData.rating.Event-1]--;
            eventSummary.summary.Event[req.body.rating.Event-1]++;
            eventSummary.summary.Breakfast[prevData.rating.Breakfast-1]--;
            eventSummary.summary.Breakfast[req.body.rating.Breakfast-1]++;
            eventSummary.summary.overall[prevData.overall-1]--;
            eventSummary.summary.overall[req.body.overall-1]++;
        }
        else{
            userExperience.create({
                eventName: event,
                email:req.body.email,
                review:{
                    Registration:req.body.review.Registration,
                    Event:req.body.review.Event,
                    Breakfast:req.body.review.Breakfast
                },
                rating:{
                    Registration:req.body.rating.Registration,
                    Event:req.body.rating.Event,
                    Breakfast:req.body.rating.Breakfast
                },
                overall:req.body.overall
            })
            eventSummary.summary.Registration[req.body.rating.Registration-1]++;
            eventSummary.summary.Event[req.body.rating.Event-1]++;
            eventSummary.summary.Breakfast[req.body.rating.Breakfast-1]++;
            eventSummary.summary.overall[req.body.overall-1]++;
        }
        await eventData.updateOne({eventName:event},{$set:eventSummary})   
        res.json({success:true,message:"Review Added Successfully"}); 
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Something went wring try again later"});
    }
})

router.get("/getReviews/:event/:startPage/:endPage", async(req,res)=> {
    let start=(req.params.startPage)*5,end=(req.params.endPage)*5-start
    let errors= await eventData.findOne({"eventName":req.params.event});;
    if (!errors) return res.json({ success:false,message: "event not exist" });
    let event=req.params.event;
    try{
        console.log(event,start,end)
        let reviewsData=await userExperience.find({'eventName':event}).skip(start).limit(end);
        return res.json({success:true,message:"fethed successfully",data:reviewsData})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Somthing went wrong try again later"});
    }
})
router.get("/getSummary/:event", async(req,res)=> {
    let eventSummary= await eventData.findOne({"eventName":req.params.event});;
    if (eventSummary==null) return res.json({ success:false,message: "event not exist" });
    try{
        return res.json({success:true,message:"fethed successfully",data:eventSummary})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Somthing went wrong try again later"});
    }
})
router.get("/getRatingByCriteria/:event/:criteria", async(req,res)=> {
    let eventSummary= await eventData.findOne({"eventName":req.params.event});;
    if (eventSummary==null) return res.json({ success:false,message: "event not exist" });
    let criteria=req.params.criteria
    try{
        return res.json({success:true,message:"fethed successfully",data:eventSummary.summary[criteria]})
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Somthing went wrong try again later"});
    }
})

router.post("/:event/addReply", async(req,res)=> {
    //validating inputs
    let errors = validateEmail(req.body.email);
    let event=req.params.event,email=req.body.email
    if (!errors) return res.json({success:false,message:"Invalid Emial"});
    errors=await eventData.findOne({"eventName":event});
    if (!errors) return res.json({success:false,message:"event not exist"});
    let managerData=await User.findOne({'email':req.body.manager})
    //console.log("managerData",managerData)
    if (managerData==null || !managerData.manager) return res.status(404).json({success:false,message:"not a valid managerax"});
    
    try{
        await userExperience.updateOne({ email:email,eventName:event}, {$set:{
            reply:req.body.reply
        }});
        res.json({success:true,message:"Reply Added Successfully"}); 
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Something went wring try again later"});
    }
})
router.put("/:event/addLike", async(req,res)=> {
    //validating inputs
    let errors = validateEmail(req.body.email);
    let event=req.params.event,email=req.body.email
    if (!errors) return res.json({success:false,message:"Invalid Emial"});
    errors=await eventData.findOne({"eventName":event});
    if (!errors) return res.json({success:false,message:"event not exist"});
    let userData=await User.findOne({'email':email})
    if (userData==null || !userData.manager) return res.status(404).json({success:false,message:"not a valid user"});

    let userExp=await userExperience.findOne({eventName:event,email:email});
    //console.log("userLikes",userExp)
    try{
        await userExperience.updateOne({ email:email,eventName:event}, {$set:{
            likes:userExp.likes+1
        }});
        res.json({success:true,message:"Like Added Successfully"}); 
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Something went wring try again later"});
    }
})
router.put("/:event/report", async(req,res)=> {
    //validating inputs
    let errors = validateEmail(req.body.email);
    let event=req.params.event,email=req.body.email
    if (!errors) return res.json({success:false,message:"Invalid Emial"});
    errors=await eventData.findOne({"eventName":event});
    if (!errors) return res.json({success:false,message:"event not exist"});
    let userData=await User.findOne({'email':email})
    if (userData==null || !userData.manager) return res.status(404).json({success:false,message:"not a valid user"});
    
    let userExp=await userExperience.findOne({eventName:event,email:email});
    //console.log("userLikes",userExp)
    let flag=(userExp.reports>4?1:0)
    try{
        await userExperience.updateOne({ email:email,eventName:event}, {$set:{
            reports:userExp.reports+1,
            flag:flag
        }});
        res.json({success:true,message:"Reported Successfully"}); 
    }
    catch(error){
        console.log(error)
        res.json({success:false,message:"Something went wring try again later"});
    }
})

module.exports = router;