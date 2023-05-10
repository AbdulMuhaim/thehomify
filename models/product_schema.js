const mongoose = require('mongoose');

const products_schema = new mongoose.Schema({
    
name: {
    type: String,
    required: true
},
image : {
    type : Array,
    required : true
},
price: {
    type: Number,
    required: true
},
quantity: {
    type: Number,
    required: true
},
brand: {
    type: String,
    required: true
},

categoryid: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "category",
    
},

status: {
    type: Boolean,
    required : true,
    default : true
    
},

description : {
    type : String,
    required : true
},
stock : {
    type : Boolean,
    required : true,
    default : true
    
}

});

const product = mongoose.model('product', products_schema);
module.exports = product;