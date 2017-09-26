/** Validators **/

module.exports = {
	isArray: function(value) {
		return Array.isArray(value);
	},
	isBoolean: function(value) {
		if (typeof value == "boolean" || typeof value == "string") {	
			value = value.toString();
			if (value) {
				return /^(true)|(false)$/.test(value);
			} else {
				return false;
			}
		}
		return false;
	},
	/**
	  * Returns true, if input is greater than or equal to minNum
	  */
	gte: function(input, minNum) {
		return input >= minNum
	},
	/**
	  * Returns true, if input is less than or equal to maxNum
	  */
	lte: function(input, maxNum) {
		return input <= maxNum
	},
	isDate: function(value) {
		if (value && value.length > 5) {
			var d = new Date(value);

			if (isNaN(d.getDate())) {
				return false;
			} else {
				return true;
			}

		} else {
			return false;
		}
	},
	/**
	  * checks whether the string is empty or not
	  */
	isEmpty: function(str) {
		return typeof str == "undefined" || str == null || str.length == 0; 
	},
	isNotEmpty: function(str) {
		return !(typeof str == "undefined" || str == null || str.length == 0);
	},
	isFloat: function(value) {
		// maximum precision of 6 digits
		return /^\d{1,}\.?\d{0,6}$/.test(value);
	},
	/**
	  * @name isNumber
	  * @param str String that may or may not be number
	  * @returns true, if str is number otherwise false
	  */
	isNumber: function(str) {
		if (str) {

			if (+str === +str) {
				// is number
				return true;
			} else {
				return false;
			}

		} else {
			if (str === 0) return true;
			// empty string
			return false;
		}
	},

    isImage: function(fileExtension) {
		return 	/^(jpg|png|jpeg|bmp)$/i.test(fileExtension);
	},

    isVideo: function(fileExtension) {
        return /^(mp4|avi|3gp|flv|mkv|mov|wmv)$/i.test(fileExtension);
    },

    isAudio: function(fileExtension) {
        return 	/^(mp3|aac|m4a)$/i.test(fileExtension);
    },

	isValidAttachment: function(fileExtension) {
		return 	/^(jpg|png|jpeg|bmp|pdf|mp3|mp4)$/i.test(fileExtension);
	},

    isValidFileExtensionForType: function(fileExtension, fileType) {
        var result = false;
        switch(fileType) {
            case "image" :
                result = this.isImage(fileExtension);
                break;

            case "video" :
                result = this.isVideo(fileExtension);
                break;

            case "audio" :
                result = this.isAudio(fileExtension);
                break;

            default :
                result = false;
        }
        return result
    },
	/**
	  * Returns true, if the given object is valid location co-ords
	  * @param data.lat - Range -90 to +90
	  * @param data.lng - Range -180 to +180
	  */ 
	isLatLng: function(data) {

		if (data && data.lat && data.lng) {
			var lat = data.lat;
			var lng = data.lng;

			if (((lat >= -90) && (lat <= 90)) // latitude validation
				((lng >= -180) && (lng <= 180)) // longitude validation
				) {
				return true;
			}
			return false;
		}
		return false;
	},
	isLengthBetween: function(value, min, max) {
		if (typeof value != "string") return false;
		return (value.length >= min && value.length <= max);
	},
	isDescription: function(str, minLength) {
		if (typeof str == "string" && str.length >= minLength) {
			return true;
		} else if (typeof str == "string" && str === "" ){
			return true;
		}
		return false;
	},
	isTimeStamp: function(input) {
		if (typeof input == "number") {
			return true;
		} else if (typeof input == "string") {
			// unix timestamp(without ms) length = 10, unix TS(with ms) length = 13
			if (input.length == 10 || input.length == 13) {
				if (isNaN(+input)) {
					return false
				} else {
					return true;
				}
			} else {
				return false;
			}
		}
	},
	isMobileOrWeb: function(endpoint) {
		if (typeof endpoint != "string") return false;
		return (endpoint.toLowerCase() == "mobile" || endpoint.toLowerCase() == "web");
	},
	// Source: http://stackoverflow.com/a/3809435/3764306
	isUrl: function(string) {

		var pattern = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/;

		return pattern.test(string);
	},
	/**
	* @description checks whether the given string is a UUID
	*/
	isUuid: function(id) {
		var uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		return uuidRegExp.test(id);
	},
	isUuidArray: function(ids) {
		if (ids && !Array.isArray(ids)) {
			try {
				ids = JSON.parse(ids);
			} catch (error) {
				// JSON parse error
				console.log("isUuidArray", "JSON parse error", error);
				return false;
			}
		}

		if (Array.isArray(ids)) {
			var uuidRegExp = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

			var isAllValid = ids.every(function(id) {
				// check whether all the array elements are of same UUID format
			 	return uuidRegExp.test(id); 
			});

			if (isAllValid) {
				return true;
			} else {
				console.log("isUuidArray", "Consists invalid UUIDs");
				return false;
			}

		} else {
			// not an array
			console.log("isUuidArray", "Not an array");
			return false;
		}
	},
	isValidFilePurpose : function(purpose){
		var defaultType = ["profileImage", "profileBannerImage", "profileBannerVideo", "giftVideo", "giftImage","image","video","audio", "webLink"];
		return defaultType.indexOf(purpose) != -1;

	},
    isValidStatus: function(status) {
        var validStatuses = ["active", "inactive", "createdByInvite", "verified"];
        return validStatuses.indexOf(status) != -1;
	},
	isValidSortOrder: function(status) {
        var validSortOrders = ["ASC", "DESC"];
        return validSortOrders.indexOf(status) != -1;
	},
	isValidGender: function(status) {
        var validGender = ["male","female","others"];
        return validGender.indexOf(status) != -1;
    },
	isValidNotificationPriority: function(priority){
		var validPriorities = ["normal", "high"]; //as per fcm documentation
		return validPriorities.indexOf(priority) != -1;
	},
	allowedFcmTypes: function(type){
		var validTypes = ["default", "forceLogout"]; // can be added further
		return validTypes.indexOf(type) != -1;
	},
	//isValidAction: function(value) {
	//	var allowedActions = ["accept", "decline"];
	//	return allowedActions.indexOf(value) != -1;
	//},
	isValidSourceType: function(type) {
		var validAssetTypes = ["addressBook","facebook","google","mobile","soyou", "internal", "external"];
		return validAssetTypes.indexOf(type) != -1;
	},

	isValidSpamType: function(type) {
		var validSpamTypes = ["gift","comment"];
		return validSpamTypes.indexOf(type) != -1;
	},

	isValidReasonType: function(type) {
		var validReasonTypes = ["spam"];
		return validReasonTypes.indexOf(type) != -1;
	},

	isValidActionType: function(value) {
		var validActionType = ["private","public"];
		return validActionType.indexOf(value) != -1;
	},

	isValidGroupActionType: function(value) {
		var isValidGroupActionType = ["GROUP_NAME_EDIT","GROUP_BANNERIMAGE_UPDATE","GROUP_IMAGE_UPDATE",
		"GROUP_BANNERIMAGE_REMOVED","GROUP_IMAGE_REMOVED","ADDED_NEW_CONTACT","REMOVED_CONTACT","LEFT_GROUP","ADDED_AS_ADMIN"];
		return isValidGroupActionType.indexOf(value) != -1;
	},

	isValueBetween: function(value, min, max) {
		if (value && value >= min && value <= max) {
			return true;
		} 
		return false;
	},
	
	isValidEmail: function(email) {
		// Source: http://stackoverflow.com/a/46181/3764306
		var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
		return re.test(email);
	},
	isValidJsonObj: function(jsonStr, canBeNull) {

		if (canBeNull && jsonStr === null) {
			return true; // for some scenarios even null is considered as object
		}

		if (jsonStr && jsonStr.length > 1) {

			try {
				var parsed = JSON.parse(jsonStr);

				if (typeof parsed == "object" && !Array.isArray(parsed)) {
					// It should be an object and it shouldn't be an array
					return true;
				}
				return false;
			} catch (error) {
				// not valid json
				console.log(error);
				return false;
			}
		}
		return false;
	},
	isValidMobileNumber: function(number) {
		return /^[0-9]{10,10}$/.test(number);
	},
    isValidCountryCode: function(code) {
        if (code) {
            code = code.toString();
            var x = code.match(/^(\+[0-9]{1,3})$/);
            return  x ? true : false;
        } else {
            return false;
        }
    },
	isValidOtpNumber: function(otp){
		if (typeof otp == 'number') {
			return (otp > 1000 && otp < 9999)
		} return false
	},
	mockFail: function(ignoredArg) {
		return false;
	},
	isValidObj: function(input, canBeNull, canBeArray) {
		if (typeof input == "object") {
			if (input == null) {
				// input is null, return true, if it can be null
				return canBeNull == true || canBeNull == 'true';
			} else if (Array.isArray(input)) {
				// no need to check whether it is array or not, either obj or array is allowed
				return canBeArray == true || canBeArray == 'true'
			} else {
				// valid obj
				return true;
			}
		} else {
			// not an object
			return false;
		}
	},
	checkForKeys: function(obj, keys, options) {
		// an util function
		// keys should be array of objects
		// like below
		/*
		  [{
		  	"name": "nameOfProperty",
		  	"optional": true
		  }]
		 */

		if (!obj || typeof obj != "object" || !Array.isArray(keys)) {
			throw new TypeError({message: "hasKeys function called with Invalid arguments"});
		}

		var validKeyCount = 0;
		var allRequiredKeysExists = true;

		for (i = 0; i < keys.length; i++) {
			if (obj.hasOwnProperty(keys[i].name)) {
				validKeyCount++;
			} else {
				if (!keys[i].optional) {
					// if not optional
					allRequiredKeysExists = false;
				}
			}
		}

		return {
			validKeyCount: validKeyCount,
			invalidKeyCount: Object.keys(obj).length - validKeyCount,
			hasAllRequiredKeys: allRequiredKeysExists
		};
	}
};