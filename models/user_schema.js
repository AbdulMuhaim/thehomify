const mongoose = require('mongoose');


const user_schema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    status:{
        type:Boolean,
        default:true,
        required:true
    },
    wishlist:[
        {
            productid:{type: mongoose.Schema.Types.ObjectId, ref:"product" }
        }
    ],
    cart:[
        {productid:{type:mongoose.Schema.Types.ObjectId,ref:'product'},
        quantity:{type:Number,default:1},
        total:{type:Number,default:0}

    }

    ],
    totalbill:{
        type:Number,
        default:0
    },
    wallet:{
        type:Number,
        default:0
    },
    
    address:[{
        name:{type:String,required:true},
        company:{type:String,required:true},
        street:{type:String,required:true},
        district:{type:String,required:true},
        state:{type:String,required:true},
        country:{type:String,required:true},
        pincode:{type:Number,required:true},
    }]
    
});

const user = mongoose.model('user',user_schema);
module.exports = user