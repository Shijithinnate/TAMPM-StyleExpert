var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var validator = require('../helpers/validators');

var userSchema = new Schema({
    "_id": String,
    "firstName": {type: String, required:true},
    "lastName": {type: String, required:true},
    "fullName": {type: String, required:false},
    "searchName":{type: String, required:false},
    "email": {type: String, required: true, unique:true},
    "password":{type: String, required: true},
    "role" : {type: String, required: false},
    "gender" : {type: String, required: true},
    "mobileNumber": {type: String, required: false},
    "countryCode": {type: String, required: false},
    "profileImage": {type: Schema.Types.Mixed, required: false},
    "fireBaseId": {type: String, required: false},
    "deviceId": {type: String, required: false},
    "unreadNotificationCount" : {type: Number, default: 0, required: false},
    "lastLogin": { type: Date, required: true },
    "createdTs": { type: Date, required: false, "default": Date.now },
    "modifiedTs": { type: Date, required: false, "default": Date.now }
});

userSchema.index({ "searchName":"text"});

userSchema.pre('save', function(next) {
    this.modifiedTs = new Date();
    if(!(validator.isEmpty( this.firstName) && validator.isEmpty( this.lastName))) {
        //full name is for search, so save with lowercase and without space
        this.searchName = this.firstName.toLocaleLowerCase().trim()+this.lastName.toLocaleLowerCase().trim()
    }
    next();
});
module.exports = userSchema;
