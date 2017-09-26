/**
  * Error Handler
  */

/**
  * @name processError
  * @description Process the system errors, DB errors or other errors
  * in System Error structure 
  * This should not be used for Request param validation. It is handled by custom_validator module
  */
var ServerResponse = require('http').ServerResponse;
var constants = require('./app.constants');
var responseCodes = constants.responseCodes;
var errorCodes = constants.errorCodes;

var processError = function(err) {

	var result = {
		errorCode: "DEF_ERR#UNCLASSIFIED",
		errno: (err && (err.code || err.status || err.errno || -1)) || -1,
		errors: [],
		responseCode: responseCodes.BAD_REQUEST
	};

	var message = "Unknown Error";

	var langErrors = ["TypeError", "RangeError", "ReferenceError", "InternalError", "SyntaxError", "URIError"];

	if (err && langErrors.indexOf(err.name) != -1) {
		// system errors, which should be thrown back, since it should be fixed
		if (err.stack && err.stack.indexOf("sync.js") != -1) {
			// System error happened inside Sync block, cannot be handled by express error middleware
			// so work around here
			console.log(err, err.stack);
			log.log(err);
			message = err.name || "Internal System Error";
			result.errorCode = "DEF_ERR#" + errorCodes.DEF_SYSTEM_ERROR;
			result.responseCode = responseCodes.SERVER_ERROR;
		} else {
			throw err;
		}
	} else if (err && err.code) {
		switch (err.code) {
			case errorCodes.DEF_UNAUTHORIZED:
			case errorCodes.DEF_NO_PERMISSION:
				message = err.message || "Unauthorized";
				result.errorCode = "DEF_ERR#" + err.code;
				result.responseCode = responseCodes.UNAUTHORIZED;
				break;
			case errorCodes.DB_NO_MATCHING_DATA:
			case errorCodes.DB_READ_FAIL:
			case errorCodes.DB_UPDATE_FAIL:
			case errorCodes.DB_DELETE_FAIL:
			case errorCodes.DB_INSERT_FAIL:
				// Database errors
				message = err.message || "Database error";
				result.errorCode = "DB_ERR#" + err.code;
				result.responseCode = responseCodes.DB_ERROR;
				break;
			case errorCodes.DEF_VALIDATION_ERROR:
				message = err.message || "Invalid param";
				result.errorCode = "VALIDATION_ERR";
				result.responseCode = responseCodes.VALIDATION_ERROR;
				break;
			case errorCodes.DB_DUPLICATE_RECORD:
				// Duplicate insertion, i.e Unique field conflict
				message = 'Record Already exists';
				result.errorCode = "DB_ERR#" + err.code;
				result.responseCode = responseCodes.DB_ERROR;
				break;
			case errorCodes.DEF_NOT_REGISTERED_DEVICE:
				message = err.message || "Unauthorized";
				result.errorCode = "DEF_ERR#" + err.code;
				result.responseCode = responseCodes.INVALID_TOKEN_NEW_DEVICE_FOUND;
				break;
			case errorCodes.DEF_SMS_NOT_SENT:
				message = err.message || "Couldn't able to send sms";
				result.errorCode = "DEF_ERR#" + err.code;
				result.responseCode = responseCodes.BAD_REQUEST;
				break;
			case errorCodes.DEF_EMAIL_NOT_VERIFIED:
				message = err.message || "Email not verified yet";
				result.errorCode = "DEF_ERR#" + err.code;
				result.responseCode = responseCodes.BAD_REQUEST;
				break;
			case errorCodes.DEF_INVALID_CODE:
				message = err.message || "OTP code mismatches";
				result.errorCode = "DEF_ERR#" + err.code;
				result.responseCode = responseCodes.BAD_REQUEST;
				break;
			case errorCodes.DEF_VERSION_DEPRECATED:
                message = err.message || "Using the deprecated version, will be obsolete soon";
                result.errorCode = "DEF_ERR#" + err.code;
                result.responseCode = responseCodes.VERSION_ERROR;
                break;
            case errorCodes.DEF_VERSION_OBSOLETE:
                message = err.message || "Endpoint is now obsolete, please check API Docs";
                result.errorCode = "DEF_ERR#" + err.code;
                result.responseCode = responseCodes.VERSION_ERROR;
                break;
			case errorCodes.DEF_VERSION_MISMATCH:
				message = err.message || "Invalid API Version";
				result.errorCode = "DEF_ERR#" + err.code;
				result.responseCode = responseCodes.VERSION_ERROR;
				break;
			default:
				message = err.message || "Unknown error";
				result.errorCode = "DEF_ERR#" + (err.code || "UNKNOWN");
				result.responseCode = responseCodes.SERVER_ERROR;
		}
	} else if (err) {
		if (typeof err == "object") {
			if (err.name == "MongoError") {
				message = err.message || "Database error";
				result.errorCode = "DB_ERR#" + errorCodes.DB_OPERATION_FAIL;
				result.responseCode = responseCodes.DB_ERROR;
				result.errno = errorCodes.DB_OPERATION_FAIL;
			} else {
				message = err.message || err.toString();
			}
		}
	}

	result.errors.push({
		"message": message,
		"param": err && err.param,
		"value": err && err.value
	});

	return result;
};


/**
 * IMPORTANT: Don't invoke any function call on `res` object, once you invoked this function.
 * Because, calling so will crash the app.
 * @name sendFormattedError
 * @description Processes the error and send the structured error response with the given response object
 * @param res {Object} Non-null Response object of Express framework
 * @param error {Object|Array|String} Error object or message to be formatted
 * @param [isValidationError] Forcefully return it as validation error
 * 	The `error` will be considered as Validation error, either if the `error` is array or
 *		if `isValidationError` is set true
 *
 * 	The error will be processed for specific type if it doesn't fit the Validation error constraint
 * @return Returns nothing, but the request will be handled here itself
 */
var sendFormattedError = function(res, error, isValidationError) {

	var errorObj;
	if (Array.isArray(error) || isValidationError === true) {
		// By default, if the error is of type array, it will be considered as validation error
		// or if forcefully said it as validation error, it will be processed here
		var result = {
			errorCode: "VALIDATION_ERR",
			errno: errorCodes.DEF_VALIDATION_ERROR,
			errors: [],
			responseCode: responseCodes.VALIDATION_ERROR
		};

		if (Array.isArray(error)) {
			result.errors = error;
		} else if (error && typeof error == "object") {
			result.errors.push({
				message: error.message || "Invalid param",
				param: error.param || null,
				value: error.value
			})
		} else if (error && typeof error == "string") {
			result.errors.push({
				message: error || "Invalid param"
			});
		} else {
			throw new Error("Invalid error caught in sendFormattedError");
		}

		errorObj = result;
	} else {
		// not validation error, process the error
		errorObj = processError(error);
	}

	if (res && res instanceof ServerResponse) {
		res.status(errorObj.responseCode);
		res.send({
			success: false,
			errors: errorObj.errors,
			errorCode: errorObj.errorCode,
			errno: errorObj.errno
		});
	} else {
		// again programmer bug in argument
		throw new TypeError('First parameter should be instance of http.ServerResponse');
	}
};

var versionDeprecatedError = function(req, res) {
    return sendFormattedError(res, {
        code: errorCodes.DEF_VERSION_DEPRECATED,
        message: "Using deprecated version, will be obsolete soon"
    });
};

var versionObsolete = function(req, res) {
    return sendFormattedError(res, {
        code: errorCodes.DEF_VERSION_OBSOLETE,
        message: "Endpoint is obsolete now, check API docs"
    });
};

var versionMismatch = function(req, res) {
    return sendFormattedError(res, {
        code: errorCodes.DEF_VERSION_MISMATCH,
        message: "Using Invalid API Version"
    });
};

module.exports = {
	sendFormattedError: sendFormattedError,
    versionDeprecatedError: versionDeprecatedError,
    versionObsolete: versionObsolete,
    versionMismatch: versionMismatch
};