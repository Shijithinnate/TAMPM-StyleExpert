var express = require('express');
var router = express.Router();
var Sync = require('sync');
var userModel = require('../models/users.model');
var authModel = require('../models/auth.model');
var mongoose = require('mongoose');
var conversationModel = require('../models/conversation.model');
var conversationSchema = require('../schemas/conversations.schema');
var Conversation = mongoose.model('Conversation', conversationSchema);
var errorHandler = require('../helpers/error_handler');
var successHandler = require('../helpers/success_handler');
var errorCodes = require('../helpers/app.constants').errorCodes;
var validator = require('../helpers/validators');
var uuid = require('node-uuid');
var util = require('../helpers/util');
var multipart = require('connect-multiparty');
var multipartMiddleware = multipart();
var s3helper = require('../helpers/aws.s3.helper');
var Q = require('q');
var bcrypt = require('bcrypt');

router.get('/', function(req, res) {
    res.json({ message: 'Welcome to the TWELVE AM:PM API center !!!'});
});

router.post('/addUser',function(req,res,next){
    req.checkBody('firstName','firstName is mandatory').isNotEmpty();
    req.checkBody('lastName','lastName is mandatory').isNotEmpty();
    req.checkBody('email','email is mandatory').isNotEmpty();
    req.checkBody('email','Invalid email').isValidEmail();
    req.checkBody('gender','gender is mandatory').isNotEmpty();
    req.checkBody('gender','Invalid gender').isValidGender();
    req.checkBody('countryCode','countryCode is mandatory').isNotEmpty();
    req.checkBody('mobileNumber','mobileNumber is mandatory').isNotEmpty();
    req.checkBody('profileImage','Invalid profileImage url').optional().isUrl();

    var errors = req.validationErrors();
    if (errors) {
        return errorHandler.sendFormattedError(res, errors);
    }
    var inputdata = {
        firstName : req.param('firstName'),
        lastName : req.param('lastName'),
        email : req.param('email'),
        password : req.param('mobileNumber'),
        countryCode : req.param('countryCode'),
        mobileNumber : req.param('mobileNumber'),
        gender : req.param('gender'),
        profileImage : req.param('profileImage'),
        adminDetails : req.currentUser
    };
    var hash=bcrypt.hashSync(inputdata.password,10);
    inputdata.password = hash;
    userModel.saveNewUser(inputdata,function(error,result){
        if (error) {
            return errorHandler.sendFormattedError(res,error);
        }
        return successHandler.sendFormattedSuccess(res,result);
    });
});

router.get('/getExpertUsers',function(req,res){
    var data = {};
    data.userId = req.currentUser._id;
    userModel.findAllExperts(data,function(error,result){
        if (error) {
            return errorHandler.sendFormattedError(res,error);
        }
        return successHandler.sendFormattedSuccess(res,result);
    });
});

router.get('/getExpertById',function(req,res){
    req.checkQuery('expertId','Invalid expertId').isUuid();
    var errors = req.validationErrors();
    if(errors){
        return errorHandler.sendFormattedError(res,errors);
    }
    var params = {
        expertId : req.param('expertId'),
        userId : req.currentUser._id
    }
    userModel.getExpertById(params,function(error,result){
        if (error) {
            return errorHandler.sendFormattedError(res,error);
        }
        return successHandler.sendFormattedSuccess(res,result);
    });
});

router.get('/getMydetails', function(req,res){
    var params = {
        userId : req.currentUser._id
    }
    userModel.getMydetails(params,function(error,result){
        if (error) {
            return errorHandler.sendFormattedError(res,error);
        }
        return successHandler.sendFormattedSuccess(res,result);
    });
});

var uploadProfileImage = function(req, res, next) {
    var files = req.files;
    var availableFiles = {};
    var userId = req.currentUser._id;
    consolelog
    if (files) {
        if (files.profileImage && files.profileImage.name) {
            // this will restrict only one image at time
            var fileExt = util.getExtension(files.profileImage.name);
            var mediaType = "image";

            if (validator.isImage(fileExt)) {
                var fileId = uuid.v1();
                var fileName =  fileId + "_profileImage" +  "." +  fileExt;
                var localDir = files.profileImage.path;//__dirname + "/../uploads/chatmedia/" + mediaType + "/";
                var s3Dir = "media/" + mediaType + "/profileImage" + "/";

                var imgWorkerData = {
                    localDir: localDir,
                    s3Dir: s3Dir,
                    originalName: files.profileImage.originalFilename,
                    fileType: files.profileImage.type,
                    fileId: fileId,
                    fileName: fileName,
                    userId: userId,
                    s3FilePath : s3Dir + fileName
                };
                // Store only the file name, folder path to the file will be appended from config
                availableFiles.profileImage = imgWorkerData;
            } else {
                return errorHandler.sendFormattedError(res, {
                    code: errorCodes.DEF_VALIDATION_ERROR,
                    message: "Not an valid image file"
                });
            }
        }
    }
    req.availableFiles = availableFiles;
    next();
};

router.post('/uploadProfileImage', multipartMiddleware, uploadProfileImage, function(req,res) {

    if (req.availableFiles.profileImage) {
        var imageData = req.availableFiles.profileImage;
        var p1 = s3helper.storeFile(imageData.localDir, imageData.s3FilePath,"image");
        Q.all([p1])
            .then(function(result){
                var params = {
                    userId : imageData.userId,
                    profileImage : process.env.S3URL + imageData.s3FilePath
                }
                userModel.updateImage(params,function(error,result){
                    if (error) {
                        return errorHandler.sendFormattedError(res,error);
                    }
                    return successHandler.sendFormattedSuccess(res,result);
                });
        })
        .catch(function(error){
            return errorHandler.sendFormattedError(res,error);
        })
        .done();
    } else {
        return errorHandler.sendFormattedError(res, {
            code: errorCodes.DEF_VALIDATION_ERROR,
            message: "You need to upload an image"
        });
    }
});

router.post('/updateUserProfile', function(req,res){
    var data = req.body;
    data.userId = req.currentUser._id;
    userModel.updateUserProfile(data,function(error,result){
        if (error) {
            return errorHandler.sendFormattedError(res,error);
        }
        return successHandler.sendFormattedSuccess(res,result);
    });
});

router.post('/changePassword',function(req,res){
    req.checkBody('currentPassword','current password is mnandatory').isNotEmpty();
    req.checkBody('newPassword','new passowrd is mandatory').isNotEmpty();
    req.checkBody('confirmPassowrd','confirm passowrd is mandatory').isNotEmpty();
    var errors = req.validationErrors();
    if(errors){
        return errorHandler.sendFormattedError(res,errors);
    }
    var params = {
        newPassword : req.param('newPassowrd'),
        confirmPassowrd : req.param('confirmPassowrd'),
        currentPassword  : req.param('currentPassword'),
        userId : req.currentUser._id
    }
    userModel.changePassword(params,function(error,result){
        if (error) {
            return errorHandler.sendFormattedError(res,error);
        }
        return successHandler.sendFormattedSuccess(res,result);
    });


})

router.post('/sendmessage',function(req,res){
  req.checkBody('targetId','Invalid targetId').isUuid();
  req.checkBody('message','mesaage cannot be empty').isNotEmpty();
  // var data=req.body;
  var errors=req.validationErrors();
  if(errors){
      return errorHandler.sendFormattedError(res,errors);
  }
  var params = {
      targetId : req.param('targetId'),
      message : req.param('message'),
      senderId : req.currentUser._id
  }
  conversationModel.sendMessage(params,function(error,result){
      if (error) {
          return errorHandler.sendFormattedError(res,error);
      }
      return successHandler.sendFormattedSuccess(res,result);
  });
})

router.get('/getConversationById',function(req,res){
  req.checkQuery('conversationId','invalid conversation id').isUuid();
  var errors=req.validationErrors();
  if(errors){
      return errorHandler.sendFormattedError(res,errors);
  }
  var query={
    conversationId:req.param('conversationId'),
    sender_id:req.currentUser._id
  }
  console.log(query);
  conversationModel.getConversationById(query,function(error,result){
    if (error) {
            return errorHandler.sendFormattedError(res,error);
        }
        return successHandler.sendFormattedSuccess(res,result);
  })
})


// router.get("/getMessageById",function(req,res){
//   req.checkQuery('messageId','invalid messageId').isUuid();
//   var errors=req.validationErrors();
//   if(errors){
//       return errorHandler.sendFormattedError(res,errors);
//   }
//   var query={
//     messageId:req.param('messageId'),
//     sender_id:req.currentUser._id
//   }
//   conversationModel.getMessageById(query,function(error,result){
//     if (error) {
//             console.log("inside /getMessageById error call");
//             return errorHandler.sendFormattedError(res,error);
//         }
//         return successHandler.sendFormattedSuccess(res,result);
//   })
// })

router.get("/getConversations",function(req,res){
  // function for getting all the conversations with id,targetid,targetname,
  var param = {
    userId : req.currentUser._id
  }
  conversationModel.getConversations(param,function(error,result){
    if(error){
        return errorHandler.sendFormattedError(res,error);
    }
    return successHandler.sendFormattedSuccess(res,result);
  });
});




module.exports = router;
