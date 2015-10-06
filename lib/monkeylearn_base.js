var MonkeylearnResponse = require('./monkeylearn_response');
var merge_options = require('./merge_options');

// var https = require('http-debug').https; //require('https');
// https.debug = 2;

var https = require('https');
var pjson = require('../package.json');

function MonkeylearnBase(auth_token, options, https_options) {
    this.auth_token = auth_token;

    this.options = merge_options(options, {
        version: 'v2',
        sandbox: false,
        debug: false,
        timeout: 5000
    });


    this.https_options = merge_options(https_options, {
        hostname: 'api.monkeylearn.com',
        port: 443,
        headers: {
            accept: '*/*'
        }
    });

    this.https_options.headers["MonkeyLearn-Client-Version"] = pjson.version;
    this.https_options.headers["Authorization"] = "Token " + this.auth_token;
    this.https_options.headers["Content-Type"] = "application/json";

    this.root_path = "/" +
        this.options.version + "/" +
        this.options.namespace + "/" +
        this.options.apiId + "/";
}

MonkeylearnBase.prototype.rootPath = function() {
    return this.root_path;
}


MonkeylearnBase.prototype.queryLimitRemaning = function() {
    if (this.queryLimitInfo || (this.queryLimitInfo || this.queryLimitInfo['x-query-limit-remaining'])) {
        return parseInt(this.queryLimitInfo['x-query-limit-remaining'], 10);
    }
    return NaN;
};

MonkeylearnBase.prototype.updateQueryLimitInfo = function(headers) {
    if (headers && headers['x-query-limit-limit']) {
        try {
            this.queryLimitInfo = {
                date: Date.parse(headers.date),
                'x-query-limit-limit': headers['x-query-limit-limit'],
                'x-query-limit-remaining': headers['x-query-limit-remaining'],
                'x-query-limit-request-queries': headers['x-query-limit-request-queries']
            }
        } catch (err) {
            this.queryLimitInfo = {
                error: err
            };
        }
    }
}

MonkeylearnBase.prototype.internal_callback = function(callback, classifier_response, https_response) {

    var classifier = this;

    https_response.on('data', function(chunk) {
        classifier_response.data(chunk);
    });

    https_response.on('end', function() {
        var error = classifier_response.complete();

        if (https_response.headers) {
            classifier.updateQueryLimitInfo(https_response.headers);
        }
        callback(error, classifier_response);
    });
}

MonkeylearnBase.prototype.startRequest = function(method, path, payload, callback) {
    var timeout = this.options.timeout;

    var classifier_response = new MonkeylearnResponse(this);

    var request_options = merge_options({
        method: method,
        path: path
    }, this.https_options);

    var req = https.request(
        request_options,
        this.internal_callback.bind(this, callback, classifier_response)
    );

    req.on('error', function(err) {
        callback({
                message: "Exception in HTTP request",
                error: err
            },
            null
        );
    });

    req.on('timeout', function() {
        callback({
                message: "Request Timeout",
                error: "Timeout > " + timeout + "ms"
            },
            null
        );
    });

    req.setTimeout(timeout);

    if (payload) {
        req.write(payload);
    } else {
        req.write("");
    }

    req.end();
}

module.exports = MonkeylearnBase;