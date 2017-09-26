/**
  * @name Custom Validators for express-validator module
  */
var validators = require('./validators');

module.exports = {
	errorFormatter: function(param, msg, value) {

		return {
			param: param,
			message: msg,
			value: value
		};

	},
	customValidators: validators
};