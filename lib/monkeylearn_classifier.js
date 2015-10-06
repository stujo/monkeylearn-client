var MonkeylearnBase = require('./monkeylearn_base');
var merge_options = require('./merge_options');

function MonkeylearnClassifier(auth_token, options, https_options) {

    this.options = merge_options(options, {
        namespace: "classifiers",
        classify_action: 'classify',
        apiId: options.classifierId
    });

    this.base = new MonkeylearnBase(auth_token, this.options, https_options);

    this.classify_path = this.base.rootPath() + this.options.classify_action + "/";
}

MonkeylearnClassifier.prototype.buildClassifyPayload = function(strings) {
    if (typeof strings == "string") {
        strings = [strings];
    }
    var payload = {
        text_list: strings
    };
    if (this.options.sandbox) {
        payload.sandbox = 1;
    }
    if (this.options.debug) {
        payload.debug = 1;
    }
    return JSON.stringify(payload);
}

MonkeylearnClassifier.prototype.detail = function(callback) {
    return this.base.startRequest("GET", this.base.root_path, null, callback);
}

MonkeylearnClassifier.prototype.classify = function(strings, callback) {
    return this.base.startRequest("POST", this.classify_path, this.buildClassifyPayload(strings), callback);
}

module.exports = MonkeylearnClassifier;
