const mongoose = require('mongoose')

const wallet_schema = new mongoose.Schema({
    status:{
        type:String,
        require:true
    },
    amount:{
        type:Number,
        require:true
    },
    date:{
        type:Date
        
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
      },
      orderId: {
        type: String,
        required: true,
      }
});

const walletData = mongoose.model('walletData',wallet_schema);
module.exports = walletData