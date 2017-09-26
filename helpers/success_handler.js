/**
 * Created by sureshsc on 9/14/16.
 */
var ServerResponse = require('http').ServerResponse;


/**
 * General function to formate the success message and send to the user
 * @param res  ServerResponse object
 * @param successObject endpoint's expected data
 * @param message Any other addition message which to be shown
 */
var sendFormattedSuccess = function (res, successObject, message){

    var response = {};
    //in future any change in this structure we can do
    response.success = true;
    response.message = message || "success";

    //checking the typeof success object
    if (typeof successObject === 'object') {
        response.data = successObject;
    } else {
        response.data = {response : successObject};
    }

    //if res is not the ServerResponse the throw error
    if (res && res instanceof ServerResponse) {
        res.status(200);
        res.send(response);
    } else {
        // again programmer bug in argument
        throw new TypeError('First parameter should be instance of http.ServerResponse');
    }
};


module.exports = {
    sendFormattedSuccess: sendFormattedSuccess
};