var MonkeylearnBase = require('./monkeylearn_base');
var merge_options = require('./merge_options');

function MonkeylearnClassifier(auth_token, options, https_options) {
    MonkeylearnBase.call(this, auth_token, merge_options(options, {
        namespace: "classifiers"
    }), https_options); // call super constructor.
}

MonkeylearnClassifier.prototype = Object.create(MonkeylearnBase.prototype);
MonkeylearnClassifier.prototype.constructor = MonkeylearnClassifier;

MonkeylearnClassifier.prototype.detail = function(callback) {
    return this.startRequest("GET", this.rootPath(), null, callback);
}

MonkeylearnClassifier.prototype.classify = function(strings, callback) {
    return this.startRequest("POST",
        this.rootPath() + "classify/",
        this.buildTextListPayload(strings),
        callback);
}

module.exports = MonkeylearnClassifier;
