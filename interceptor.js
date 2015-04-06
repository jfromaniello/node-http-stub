var http = require('http');
var request = http.request.bind(http);
var EventEmitter = require('events').EventEmitter;

var emitter = module.exports = new EventEmitter();

function normalize_host (options) {
  var host = options.host || options.hostname;
  var port = options.port || '80';
  return host + ':' + port;
}

http.request = function (options, callback) {
  var key = normalize_host(options);
  emitter.emit('request', key, options);
  return request(options, callback);
};