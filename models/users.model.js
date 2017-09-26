var mongoose = require('mongoose');
var UsersSchema = require('../schemas/users.schema.js');
var Admin = mongoose.model('admin', UsersSchema);
var User = mongoose.model('user', UsersSchema);
var validator = require('../helpers/validators');
var errorCodes = require('../helpers/app.constants').errorCodes;
var uuid = require('node-uuid');


var saveNewUser = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "saveNewUser > callback must be a function"});
    }

    if (!validator.isUuid(params.adminDetails._id)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid userdsfdfId",
            param : "userId"
        });
    }
    var query = {
        _id : params.adminDetails._id,
        role : params.adminDetails.role,
        email : params.adminDetails.email
    };
    var exclude = '-__v';
    Admin.findOne(query,exclude).exec(function(error,adminResult){
        if(error){
            return callback(error);
        } else if (adminResult) {
            // 'Admin' to 'User' {email:params.email}
            User.findOne({ $and: [{ email: params.email }, {role:'expertUser'}] },function(error,newExpert){
                if(error){
                    return callback(error);
                } else if (!newExpert) {
                    // 'Admin' to 'User'
                    var newUser = new User({
                        _id : uuid.v1(),
                        firstName : params.firstName,
                        lastName : params.lastName,
                        fullName : params.fullName,
                        email : params.email,
                        password : params.password,
                        role : 'expertUser',
                        gender : params.gender,
                        mobileNumber : params.mobileNumber,
                        countryCode : params.countryCode,
                    });
                    if(params.profileImage){
                        newUser.profileImage = params.profileImage;
                    }
                    if(params.deviceId){
                        newUser.deviceId = params.deviceId;
                    }
                    newUser.lastLogin = new Date();
                    newUser.save(function(error,userData){
                        return callback(error,{user:userData,isNewProfile:true});
                    });
                }else{
                    return callback({
                        error : errorCodes.DB_DUPLICATE_RECORD,
                        message : "User is already registered.",
                        param : "email"
                    });
                }
            })
        }else{
            return callback({
                error : errorCodes.DB_NO_MATCHING_DATA,
                message : "Invalid userId"
            });
        }
    });
}
var findAllExperts = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "saveNewUser > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid userdsfdfId",
            param : "userId"
        });
    }
    var query = {
        _id : params.userId,
        role : 'adminuser',
    };
    var exclude = '-__v';
    Admin.findOne(query,exclude).exec(function(error,adminResult){
        if(error){
            return callback(error);
        }else if(adminResult){
            User.find({role:'expertUser'},{__v:0,password:0},function(error,experts){
                if(error){
                    return callback(error);
                }
                return callback(error,experts);
            });
        }else{
            return callback({
                error : errorCodes.DB_NO_MATCHING_DATA,
                message : "Invalid userId"
            });
        }
    });
}

var getExpertById = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }

    if (typeof callback != "function") {
        throw new TypeError({message: "getExpertById > callback must be a function"});
    }

    if (!validator.isUuid(params.expertId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid expertId",
            param : "expertId"
        });
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid userId",
            param : "userId"
        });
    }

    var query = {
        _id : params.userId,
        role : 'adminuser',
    };
    var exclude = '-__v';
    Admin.findOne(query,exclude).exec(function(error,adminResult){
        if(error){
            return callback(error);
        } else if (adminResult) {
            //'Admin' to 'User'
            User.findOne({_id:params.expertId,role:'expertUser'},{__v:0,password:0},function(error,expertData){
                if(error){
                    return callback(error);
                }else if(expertData){
                    return callback(error,expertData);
                }else{
                    return callback({
                        error : errorCodes.DB_NO_MATCHING_DATA,
                        message : "Invalid expertId",
                        param : "expertId"
                    });
                }
            });
        }else{
            return callback({
                error : errorCodes.DB_NO_MATCHING_DATA,
                message : "Invalid userId"
            });
        }
    });
}

var getMydetails = function(params,callback){
    if (typeof callback != "function") {
        throw new TypeError({message: "getMydetails > callback must be a function"});
    }
    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid userId",
            param : "userId"
        });
    }
    //'Admin' to 'User'
    User.findOne({_id:params.userId},{__v:0,password:0}).exec(function(error,userResult){
        if(error){
            return callback(error);
        }
       return callback(error,userResult);
    });
};

var updateImage = function(params,callback){
    if (typeof callback != "function") {
        throw new TypeError({message: "updateImage > callback must be a function"});
    }

    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user id",
            param : "userId"
        });
    }
    //'Admin' to 'User'
    User.findOneAndUpdate({_id:params.userId},{$set:{profileImage:params.profileImage}},{new: true}).exec(function(err, user){
        if (err) {
            return callback(err);
        }
        var userData = user.toObject();
        delete userData.__v;
        delete userData.password;
        return callback(err,userData);
    });
};

var updateUserProfile = function(params,callback){

    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }
    if (typeof callback != "function") {
        throw new TypeError({message: "updateUserProfile > callback must be a function"});
    }
    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user id",
            param : "userId"
        });
    }
    var userResult = {};
    if (params.firstName && typeof params.firstName === 'string') {
        userResult.firstName = params.firstName.trim();
    }
    if (params.lastName && typeof params.lastName === 'string') {
        userResult.lastName = params.lastName.trim();
    }
    if (params.firstName && params.lastName && typeof params.firstName === 'string' && typeof params.lastName === 'string'){
        userResult.fullName = params.firstName.trim()+" "+params.lastName.trim();
    }
    if (params.firstName && params.lastName && typeof params.firstName === 'string' && typeof params.lastName === 'string'){
        userResult.searchName = params.firstName.toLocaleLowerCase().trim()+params.lastName.toLocaleLowerCase().trim();
    }
    if (params.gender && validator.isValidGender(params.gender)){
        userResult.gender = params.gender;
    }
    if (params.profileImage && validator.isUrl(params.profileImage)){
        userResult.profileImage = params.profileImage;
    }
    if (params.mobileNumber){
        userResult.mobileNumber = params.mobileNumber;
    }
    if (params.countryCode){
        userResult.countryCode = params.countryCode;
    }
    User.findByIdAndUpdate(params.userId,{$set:userResult},{new:true},function(error,updatedResult){
        if(error){
            return callback(error);
        }
        return callback(error,updatedResult);
    });
}

var changePassword = function(params,callback){
    if (!params || typeof params != "object") {
        throw new TypeError({message: "params must be a valid object"});
    }
    if (typeof callback != "function") {
        throw new TypeError({message: "changePassword > callback must be a function"});
    }
    if (!validator.isUuid(params.userId)) {
        return callback({
            error : errorCodes.DEF_VALIDATION_ERROR,
            message : "Invalid user id",
            param : "userId"
        });
    }
}

module.exports = {
    saveNewUser : saveNewUser,
    findAllExperts : findAllExperts,
    getExpertById : getExpertById,
    getMydetails : getMydetails,
    updateImage : updateImage,
    updateUserProfile : updateUserProfile,
    changePassword : changePassword
}
