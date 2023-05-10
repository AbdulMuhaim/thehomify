const mongoose= require('mongoose')

const Schema=mongoose.Schema


const banner_schema= new Schema({
    name:{
        type:String,    
        required:true
    },
    image:{
        type:Array,
        required:true
    },status:{
        type:Boolean,
        required:true,
        default:true
    },
    description:{
        type:String
    },
    url:{
        type:String,
        require:true,
    }

})


const banner=mongoose.model("banner",banner_schema)
module.exports=banner;