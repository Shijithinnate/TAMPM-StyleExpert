var mongoose = require('mongoose');
require('mongoose-double')(mongoose);
var Schema = mongoose.Schema;
var validator = require('../helpers/validators');

var productSchema = new Schema({
    "_id": String,
    "productName": {type: String, required:true},
    "productPrice": {type: Number, required:true},
    "productDesc": {type: String, required:false},
    "productCategory":{type: String, required: false},
    "productSizes": {type:Schema.Types.Mixed, required: false},
    "productColors" : {type:Schema.Types.Mixed, required: false},
    "productBrand" : {type:String,required:false},
    "imageUrl" : {type: String, required: false},
    "createdTs": { type: Date, required: false, "default": Date.now },
    "modifiedTs": { type: Date, required: false, "default": Date.now }
});

productSchema.pre('save', function(next) {
    this.modifiedTs = new Date();
    next();
});

module.exports = productSchema;