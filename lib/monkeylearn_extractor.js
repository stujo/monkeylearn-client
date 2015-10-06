var MonkeylearnBase = require('./monkeylearn_base');
var merge_options = require('./merge_options');

function MonkeylearnExtractor(auth_token, options, https_options) {
    MonkeylearnBase.call(this, auth_token, merge_options(options, {
        namespace: "extractors"
    }), https_options); // call super constructor.
}

MonkeylearnExtractor.prototype = Object.create(MonkeylearnBase.prototype);
MonkeylearnExtractor.prototype.constructor = MonkeylearnExtractor;


MonkeylearnExtractor.prototype.extractKeywords = function(strings, callback) {
    return this.startRequest("POST",
        this.rootPath() + "extract/",
        this.buildTextListPayload(strings),
        callback);
}

module.exports = MonkeylearnExtractor;
