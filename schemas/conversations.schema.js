var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;

var conversationSchema = new Schema({
  "_id":{type:String},
  "participants":{type:Schema.Types.Mixed},
  "messages":{type:Schema.Types.Mixed, ref:"messages"},
  "createdTs": { type: Date, required: false, "default": Date.now },
  "modifiedTs": { type: Date, required: false, "default": Date.now }
});

conversationSchema.pre('save', function(next) {
  this.modifiedTs = new Date();
  next();
});

module.exports = conversationSchema;
