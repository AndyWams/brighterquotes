let mongoose = require('mongoose');

//posts schema

let kwoteSchema = mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  }
  ,
  date: {
    type : Date, 
    default: Date.now
  }
})

let Kwote = module.exports = mongoose.model('kwotes',kwoteSchema);
