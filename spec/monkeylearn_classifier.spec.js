var MonkeylearnClassifier = require('../index').Classifier;

var BaseStubbing = require('./helpers/base_stubbing');

describe("MonkeylearnClassifier", function() {
    "use strict";

    var TEST_CLASSIFIER_ID = 'xyz0123';

    describe('#extract', function() {
        var classifier;
        "use strict";
        beforeEach(function() {
            classifier = new MonkeylearnClassifier(BaseStubbing.PRETEND_AUTH_TOKEN, {
                apiId: TEST_CLASSIFIER_ID,
                timeout: BaseStubbing.TEST_TIMEOUT
            });

        });

        afterEach(function() {
            BaseStubbing.unstubHttpsRequest();
        });

        var TEST_RESPONSE_ERROR_1 = {
            status_code: 409,
            detail: "SOME ERROR"
        };

        it('returns server error messages', function() {
            var stubbing = BaseStubbing.stubHttpsRequest();

            stubbing.fakeResponse(TEST_RESPONSE_ERROR_1);

            classifier.classify("", function(error, result) {
                expect(error.error).equal(TEST_RESPONSE_ERROR_1.status_code);
            });
        });

        describe("with valid data", function() {
            "use strict";
            var stubbing;
            
            var TEST_DATA_1 = [
                "Reading newspapers and magazines for articles",
                "Sailing around in boats on the ocean"
            ];

            var EXPECTED_PAYLOAD_1 = JSON.stringify({
                text_list: TEST_DATA_1
            });

            var TEST_RESPONSE_DATA_1 = {
                "result": [
                    [{
                        "probability": 0.139,
                        "label": "Entertainment & Recreation"
                    }, {
                        "probability": 0.651,
                        "label": "Magazines"
                    }],
                    [{
                        "probability": 0.894,
                        "label": "Travel"
                    }, {
                        "probability": 0.961,
                        "label": "Transportation"
                    }, {
                        "probability": 0.995,
                        "label": "Watercraft"
                    }]
                ]
            };

            beforeEach(function() {
                stubbing = BaseStubbing.stubHttpsRequest();
                stubbing.fakeResponse(TEST_RESPONSE_DATA_1);
            });



            it('classifies the data via the API', function() {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    assert.deepEqual(result.results(), TEST_RESPONSE_DATA_1.result);
                });
            });

            it('sends the data in the payload to the API', function() {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    assert(stubbing.request_write_spy.withArgs(EXPECTED_PAYLOAD_1).calledOnce);
                });
            });

            it('sets the https timeout', function() {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    assert(stubbing.request_setTimeout_spy.withArgs(BaseStubbing.TEST_TIMEOUT).calledOnce);
                });
            });

            it('sends the auth token in the headers to the API', function() {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    var request_call_args = stubbing.https_request_stub.getCall(0).args;
                    expect(request_call_args[0].headers.Authorization).equal("Token " + BaseStubbing.PRETEND_AUTH_TOKEN);
                });
            });

            it('uses the specified classifierId with the API', function(done) {
                classifier.classify(TEST_DATA_1, function(error, result) {
                    var request_call_args = https_request_stub.getCall(0).args;
                    expect(request_call_args[0].path).equal('/v2/classifiers/' + TEST_CLASSIFIER_ID + '/classify/');
                    done();
                });
            });
        });
    });
});
