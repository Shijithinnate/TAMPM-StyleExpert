/**
  *  App-wise constants can be defined here
  *  Important note: There are sensitive data, just constants should be defined here
  *	 Exposure of this file should never cause impact to product or service
  */

module.exports = {
	
	responseCodes: {
		"SUCCESS": 200,
		"NO_DATA_FOUND": 204,
		"BAD_REQUEST": 400,
		"INVALID_TOKEN": 401,
		"UNAUTHORIZED": 401,
		"ACCESS_RESTRICTED": 403,
		"FORBIDDEN": 403,
		"NOT_FOUND": 404,
		"INVALID_TOKEN_NEW_DEVICE_FOUND": 423, // This is custom reserved token, don't use same anywhere else
		// 432-450 unassigned
		"VALIDATION_ERROR": 432, 
		"NO_DATA_FOUND_ERROR": 433,
		"VERSION_ERROR": 434,
		"CLIENT_VERSION_ERROR": 435, // This error occurs, when the client (i.e, Android for now) requesting the API is no longer supported. 
		"SERVER_ERROR": 500,
		"DB_ERROR": 503
	},
	errorCodes : {
		// Below are errors listed in Mongoose library
		"DB_DUPLICATE_RECORD": 11000,

		// Below are our System (or Server) defined error codes
		// first 2 digits are alphabet number of the first two digit, here DE => 45
		// followed by two digit error number
		"DEF_NOT_REGISTERED_DEVICE": 4501,
		"DEF_SMS_NOT_SENT": 4502,
		"DEF_EMAIL_NOT_VERIFIED": 4503,
		"DEF_INVALID_CODE": 4504,
		"DEF_VALIDATION_ERROR": 4505,
		"DEF_UNAUTHORIZED": 4506,
		"DEF_NO_PERMISSION": 4507,
		"DEF_SYSTEM_ERROR": 4508,
		"DEF_VERSION_DEPRECATED": 4509,
		"DEF_VERSION_OBSOLETE": 4510,
		"DEF_VERSION_MISMATCH": 4511,
		"DB_UPDATE_FAIL": 4201,
		"DB_DELETE_FAIL": 4202,
		"DB_INSERT_FAIL": 4203,
		"DB_READ_FAIL": 4204,
		"DB_NO_MATCHING_DATA": 4205,
		"DB_OPERATION_FAIL": 4206
	},


};
