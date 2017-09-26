var AWS = require('aws-sdk');
var fs = require('fs');
var request = require('request');


AWS.config.accessKeyId =  process.env.AWS_ACCESS_KEY;
AWS.config.secretAccessKey =  process.env.AWS_SECRET_KEY;
AWS.config.apiVersion = '2006-03-01';

var BucketName = process.env.AWS_BUCKET_NAME;


var downloadFile = function(srcUri,destPath,callback) {
	request.head(srcUri, function(err,res,body) {
        if (err) {
			return callback(err, null);
		}
		request(srcUri).pipe(fs.createWriteStream(destPath)).on('close',callback);
	});
};

var isRemoteFileExists = function(url, callback) {
	request.head(url, function(err, res, body) {

		if (err) {
			return callback(null, false);
		} else {
			if ([200, 304].indexOf(res.statusCode) != -1) {
				return callback(null, true);
			} else {
				return callback(null, false);
			}
		}
	});
};



module.exports = {
    storeFile: function(localPath,remotePath,fileType,callback) {
        var s3 = new AWS.S3();
        if (typeof callback !== "function") {
			callback = function(err,result) {
				console.log("fake callback");
			}
		}

		s3.putObject({
			Bucket: BucketName,
			Key: remotePath,
			Body: fs.readFileSync(localPath),
			ACL: 'public-read',
			ContentType: fileType
		}, function(err,data) {
			if (err) {
				console.log("error moving to s3", err);
				callback(err);
			} else {
				callback(err, data);
			}
		});	

	},
	isRemoteFileExists : isRemoteFileExists,
	downloadFile : downloadFile
};