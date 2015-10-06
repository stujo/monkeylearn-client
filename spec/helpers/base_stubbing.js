// To Stub the API requests
//
var sinon = require('sinon');
var https = require('https');
var PassThrough = require('stream').PassThrough;

function BaseStubbing() {


}

BaseStubbing.PRETEND_AUTH_TOKEN = "XXXPRETEND_AUTH_TOKENXXX";
BaseStubbing.TEST_CLASSIFIER_ID = 'xyz';
BaseStubbing.TEST_TIMEOUT = 3999;

BaseStubbing.stubHttpsRequest = function() {
    https_request_stub = sinon.stub(https, 'request');

    request_mock = new PassThrough();
    request_mock.setTimeout = function() {}

    request_setTimeout_spy = sinon.spy(request_mock, 'setTimeout');
    request_write_spy = sinon.spy(request_mock, 'write');
    request_on_spy = sinon.spy(request_mock, 'on');

    return {
        https_request_stub: https_request_stub,
        request_mock: request_mock,
        request_setTimeout_spy: request_setTimeout_spy,
        request_write_spy: request_write_spy,
        request_on_spy: request_on_spy,
        fakeResponse: function(fake_data) {
            https_request_stub.callsArgWith(1, BaseStubbing.fakeResponse(fake_data) )
                .returns(request_mock);
        }
    };
}

BaseStubbing.fakeResponse = function(json) {
    var fake_response = new PassThrough();
    fake_response.write(JSON.stringify(json));
    fake_response.end();
    return fake_response;
}


BaseStubbing.unstubHttpsRequest = function() {
    if (https.request.restore) {
        https.request.restore();
    }
};



module.exports = BaseStubbing;
