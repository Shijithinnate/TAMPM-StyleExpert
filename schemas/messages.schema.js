var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
// target is shuld be ref to userModel
var messageSchema = new Schema({
  "_id":{type:String},
  "senderId":{type:String,required:true, ref:"admin"},
  "targetId":{type:String,required:true, ref:"admin"},
  "message":{type:String, required:true},
  "available":{type:String,enum:["True","False"], default:"True"},
  "mediaType":{type:String, required:true, default:"Text"},
  "image":{type:String, required:false},
  "createdTs": { type: Date, required: false, "default": Date.now },
  "modifiedTs": { type: Date, required: false, "default": Date.now }
});

messageSchema.pre('save', function(next) {
  this.modifiedTs = new Date();
  next();
});

module.exports = messageSchema;
