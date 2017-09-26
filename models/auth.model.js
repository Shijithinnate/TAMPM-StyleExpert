var mongoose = require('mongoose');
var UsersSchema = require('../schemas/users.schema.js');
var Admin = mongoose.model('admin', UsersSchema);
var User = mongoose.model('user', UsersSchema);
var errorCodes = require('../helpers/app.constants').errorCodes;
var validator = require('../helpers/validators');
var userModel = require('../models/users.model');
var request = require('request');
var jwt    = require('jsonwebtoken');
var Q = require('q');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt');

var saveNewUser = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "saveNewUser > callback must be a function"});
    }

    var newUser = new Admin({
        _id : uuid.v1(),
        firstName : params.firstName,
        lastName : params.lastName,
        fullName : params.fullName,
        email : params.email,
        password : params.password,
        role : 'adminuser',
        gender : params.gender,
        phoneNumber : params.phoneNumber,
        countryCode : params.countryCode
    });
    if(params.profileImage){
        newUser.profileImage = params.profileImage;
    }
    if(params.deviceId){
        newUser.deviceId = params.deviceId;
    }
    newUser.lastLogin = new Date();

    newUser.save(function(error,userData){
          return callback(error, { user : userData, isNewProfile: true});
    });

}

var verifyUser = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "verifyUser > callback must be a function"});
    }
    var query = {
        email : params.email,
    }
    var exclude = '-__v';
    User.findOne(query,exclude).exec(function(error,result){
        if(error){
            return callback(error);
        }else if(result){
            if(bcrypt.compareSync(params.password,result.password)){
                var userData = result.toObject();
                delete userData.__v;
                delete userData.password;
                return callback(null,{user:userData,isNewProfile: false,token:__generateToken(userData)});
            }else{
                return callback({
                    error : errorCodes.DB_NO_MATCHING_DATA,
                    message : "Wrong password",
                    params : "password"
                });
            }
        }else{
            return callback({
                error:errorCodes.DB_NO_MATCHING_DATA,
                message : "User is not registered.",
                param : "email"
            });
        }
    });
}

function __generateToken (user){
    token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: 60480000 // expires in 700 days
    });
    return token;
}

module.exports = {
    verifyUser : verifyUser,
    saveNewUser : saveNewUser
}
