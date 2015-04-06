var http = require('http');
var request = http.request.bind(http);

var https = require('https');
var https_request = https.request.bind(http);

var EventEmitter = require('events').EventEmitter;

var emitter = module.exports = new EventEmitter();

http.request = function (options, callback) {
  emitter.emit('request', options);
  return request(options, callback);
};

https.request = function (options, callback) {
  options._https_stub = true;
  emitter.emit('request', options);
  return https_request(options, callback);
};