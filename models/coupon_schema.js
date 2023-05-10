const mongoose = require('mongoose')

const coupon_schema = new mongoose.Schema({

    couponId:{
        type:String,
        require:true,
        unique:true,
    },
    addDate:{
        type:Date,
        default: Date.now()
    },
    discount:{
        type:String,

    },
    maxLimit:{
     type: Number,
    },
    
    minPurchase:{
        type:Number,
    },
    expDate:{
        type:Date,
        required:true,

    },
    status:{
        type:Boolean,
        default:true,
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user',

    }
    
})

const coupon=mongoose.model('coupon',coupon_schema)
module.exports=coupon;