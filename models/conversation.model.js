var mongoose = require('mongoose');
var conversationSchema = require('../schemas/conversations.schema');
var Conversation = mongoose.model('Conversation', conversationSchema);
var messageSchema = require('../schemas/messages.schema');
var Message = mongoose.model('messages', messageSchema);
var UsersSchema = require('../schemas/users.schema.js');
var Admin = mongoose.model('admin', UsersSchema);
var User = mongoose.model('user', UsersSchema);
var validator = require('../helpers/validators');
var errorCodes = require('../helpers/app.constants').errorCodes;
var uuid = require('node-uuid');
var bcrypt = require('bcrypt');


var sendMessage = function(params,callback){
  if (!params || typeof params != "object") {
    throw new TypeError({message: "params must be a valid object"});
  }
  if (typeof callback != "function") {
    throw new TypeError({message: "sendMessage > callback must be a function"});
  }
  if(params.senderId == params.targetId){
    return callback({message:"Target ID and sender ID can be same"})
  }

  User.findOne({_id:params.targetId},function(error,userResult){
    if (error) {
      return callback(error);
    } else if(userResult){
      var newMessage = new Message({
        _id : uuid.v1(),
        targetId : params.targetId,
        senderId : params.senderId,
        message : params.message
      })

      newMessage.save(function(error,messageData){
        if(error){
          return callback(error);
        }
        Conversation
        .findOneAndUpdate(
          {participants:{$all:[params.senderId,params.targetId]}},
          {$push:{messages:messageData._id}},
          {new:true}
        )
        .populate('messages messages.targetId messages.senderId message.mediaType','-__v')
        .exec(function(error,conversationResult){
          if(error){
            return callback(error);
          }else if(conversationResult){
            return callback(error,conversationResult);
          }else{
            var participants = [];
            participants.push(params.senderId);
            participants.push(params.targetId);
            var messages = [];
            messages.push(messageData._id);
            var conversationData = new Conversation({
              _id : uuid.v1(),
              participants : participants,
              messages : messages
            });
            conversationData.save(function(error,result){
              if(error){
                return callback(error);
              }
              return callback(error,result);
            });
          }
        });
      });
    } else {
      return callback({
        error : errorCodes.DB_NO_MATCHING_DATA,
        message : {message: "No matching data" }
      })
    }
  });
}


var getConversationById = function(params,callback){
  if (!params || typeof params != "object") {
      throw new TypeError({message: "params must be a valid object"});
  }

  if (typeof callback != "function") {
      throw new TypeError({message: "sendMessage > callback must be a function"});
  }
  if (!validator.isUuid(params.sender_id)) {
      return callback({
          error : errorCodes.DEF_VALIDATION_ERROR,
          message : "Invalid sender id",
          param : "sender ID"
      });
  }
  //{_id:params.conversationId}
  Conversation.findOne({ _id: params.conversationId, __v: 0})
  .populate('messages','-__v')
  .populate({
    path:'messages',
    populate:{
      path:'targetId',
      model:'user',
      select: { 'firstName': 1, 'lastName': 1, 'profileImage': 1, 'fullName': 1 , 'role':1}
    }
  })
  .populate({
    path:'messages',
    populate:{
      path:'senderId',
      model:'user',
      select: { 'firstName': 1, 'lastName': 1, 'profileImage': 1, 'fullName': 1, 'role':1}
    }
  })
  .exec(function(error,result){
    if(error){
      return callback(error)
    }
    return callback(error,result);

})

}
var getConversations = function(params,callback){
  if (!params || typeof params != "object") {
      throw new TypeError({message: "params must be a valid object"});
  }

  if (typeof callback != "function") {
      throw new TypeError({message: "getConversations > callback must be a function"});
  }
  if (!validator.isUuid(params.userId)) {
      return callback({
          error : errorCodes.DEF_VALIDATION_ERROR,
          message : "Invalid sender id",
          param : "sender ID"
      });
  }

  Conversation.find({ participants: params.userId }, { messages: {$slice: -1} , __v:0})
      .populate('messages', '-__v')
      
      .populate({
          path: 'messages',
          populate: {
              path: 'targetId',
              model: 'user',
              select: { 'firstName': 1, 'lastName': 1, 'profileImage': 1, 'fullName': 1, 'role':1 }
          }
      })
      .populate({
          path: 'messages',
          populate: {
              path: 'senderId',
              model: 'user',
              select: { 'firstName': 1, 'lastName': 1, 'profileImage': 1, 'fullName':1, 'role':1 }
          }
      })
  .exec(function(error,result){
    if(error){
      return callback(error)
      }
    // iterate over the array[obj1,obj2,obj3....]
    //var result1 = new Array();
    //for (var i in result) {
    //    var tempdata = {
    //        _id1: result[i]._id,
    //        participants1: result[i].participants
    //        //Msgs: result[i].messages[messages.length - 1]
    //    }
    //    result1.push(tempdata)
    //}
    //console.log(result1)
    return callback(error,result)
  })
}

module.exports = {
    // findUserByFacebookId : findUserByFacebookId,
    sendMessage : sendMessage,
    getConversationById:getConversationById,
    getConversations:getConversations
  //  getConversation:getConversation
};
