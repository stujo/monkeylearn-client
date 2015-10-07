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

    if (!this.options.apiId) {
        throw "Options must include apiId which is the classifier or extractorId";
    }

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

MonkeylearnBase.prototype.internal_callback = function(resolve, reject, classifier_response, https_response) {

    var that = this;

    https_response.on('data', function(chunk) {
        classifier_response.data(chunk);
    });

    https_response.on('end', function() {
        var error = classifier_response.complete();
        if (https_response.headers) {
            that.updateQueryLimitInfo(https_response.headers);
        }
        if (error) {
            reject(error) // rejects the promise with `error` as the reason

        } else {
            resolve(classifier_response) // fulfills the promise with `classifier_response` as the value
        }
    });
}

MonkeylearnBase.prototype.startRequest = function(method, path, payload, callback) {
    var timeout = this.options.timeout;

    var that = this;

    var promise = new Promise(function(resolve, reject) {

        var classifier_response = new MonkeylearnResponse(this);

        var request_options = merge_options({
            method: method,
            path: path
        }, that.https_options);

        var req = https.request(
            request_options,
            that.internal_callback.bind(that, resolve, reject, classifier_response)
        );

        req.on('error', function(err) {
            reject({
                message: "Exception in HTTP request",
                error: err
            }); // rejects the promise with `er` as the reason
        });

        req.on('timeout', function() {
            reject({
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

        if (callback) {
            promise.then(function(data) {
                callback(null, data);
            }).catch(function(error) {
                callback(error, null);
            });
        }

    });

    return promise;
}

MonkeylearnBase.prototype.buildTextListPayload = function(strings) {
    if (typeof strings == "string") {
        strings = [strings];
    }
    var payload = {
        text_list: strings
    };
    return JSON.stringify(payload);
}


module.exports = MonkeylearnBase;
