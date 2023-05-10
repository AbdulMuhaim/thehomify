const mongoose = require('mongoose')

const category_schema = new mongoose.Schema({
  
name: {
    type: String,
    require: true
  },
status:{
    type:Boolean,
    default:true
  }

});

const category =  mongoose.model('category', category_schema);

module.exports = category