# MonkeyLearn Client for JavaScript/Node

## Usage

This package requires an auth token from MonkeyLearn, available [here](https://app.monkeylearn.com/accounts/user/settings/tab/api-tab)

### NPM Package

Install the package into your project
```
$ npm install monkeylearn-client --save
```

#### Classifier Example

```
var Classifier = require('monkeylearn-client').Classifier;

var classifier = new Classifier(process.env['MONKEYLEARN_AUTH_TOKEN'], 
                                {
                                  apiId: 'cl_5icAVzKR' // Generic Classifier
                                });
var strings = [
    "Hello World",
    "Foxes, Horses, Bunnies and Ducklings"
  ];

classifier.classify(strings)
  .then(function(response){
    console.log(JSON.stringify(response.results()));
    console.log("Query Limit Remaning : " + classifier.queryLimitRemaning());
  })
  .catch(function(error){
    console.error("ERROR", error);
  });                               
```

##### Command Line Demo Example
```
$ export MONKEYLEARN_AUTH_TOKEN=YOUR_AUTH_TOKEN
$ ./bin/classify "Hello World"
```


#### Keyword Extractor Example

```
var Extractor = require('monkeylearn-client').Extractor;

var extractor = new Extractor(process.env['MONKEYLEARN_AUTH_TOKEN'], 
                                {
                                  apiId: 'ex_y7BPYzNG' // Generic Extractor
                                });
var strings = [
    "Hello World"
];

extractor.extractKeywords(strings)
  .then(function(response){
    console.log(JSON.stringify(response.results()));
    console.log("Query Limit Remaning : " + extractor.queryLimitRemaning());
  })
  .catch(function(error){
    console.error("ERROR", error);
  });
                            
```

##### Command Line Demo Example
```
$ export MONKEYLEARN_AUTH_TOKEN=YOUR_AUTH_TOKEN
$ ./bin/keyword_extract "Hello World"
```

## Development

* Run tests with ``$ gulp mocha``
* Run tests on change with ``$ gulp watch-mocha``
* Debug tests with ``$ node-debug _mocha spec --require spec/helpers/chai.js``

