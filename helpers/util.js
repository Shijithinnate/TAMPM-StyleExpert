/**
 * @description returns the extension of given filename
 * @example getExtension("profile.jpg") returns "jpg"
 */
var getExtension = function(filename) {
    if (filename && filename.length > 3) {
        return filename.substr(filename.lastIndexOf('.')+1);
    }
};

module.exports = {
    getExtension : getExtension
};