var express = require('express');
var router = express.Router();
var authModel = require('../models/auth.model');
var errorHandler = require('../helpers/error_handler');
var successHandler = require('../helpers/success_handler');
var validator = require('../helpers/validators');
var uuid = require('node-uuid');
var bcrypt = require('bcrypt');


router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the TWELVE AM:PM API center !!!'});
});

router.post('/register',function(req,res,next){
    req.checkBody('firstName','firstName is mandatory').isNotEmpty();
    req.checkBody('lastName','lastName is mandatory').isNotEmpty();
    req.checkBody('email','Invalid email').isValidEmail();
    req.checkBody('password','password is mandatory').isNotEmpty();
    req.checkBody('countryCode','countryCode is mandatory').isNotEmpty();
    req.checkBody('mobileNumber','mobileNumber is mandatory').isNotEmpty();
    req.checkBody('gender','Invalid gender').isValidGender();
    req.checkBody('profileImage','Invalid profileImage url').optional().isUrl();
    var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }
    var userData = {
          firstName : req.param('firstName'),
          lastName : req.param('lastName'),
          email : req.param('email'),
          countryCode : req.param('countryCode'),
          mobileNumber : req.param('mobileNumber'),
          gender : req.param('gender'),
          profileImage : req.param('profileImage')
    };
    var hash=bcrypt.hashSync(req.param('password'),10);
    userData.password = hash;

    authModel.saveNewUser(userData,function(error,result){
    if (error) {
        return errorHandler.sendFormattedError(res,error);
    }
    return successHandler.sendFormattedSuccess(res,result);
  });
});

router.post('/login',function(req,res){
    req.checkBody('email','email is mandatory').isNotEmpty();
    req.checkBody('password','password is mandatory').isNotEmpty();
    var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }
    var userData = {
          email : req.param('email'),
          password : req.param('password'),
    };

    authModel.verifyUser(userData,function(error,result){
    if (error) {
        return errorHandler.sendFormattedError(res,error);
    }
    return successHandler.sendFormattedSuccess(res,result);
  });
});

module.exports = router;
