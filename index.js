var freeport = require('freeport');
var interceptor = require('./interceptor');
var http = require('http');

function HttpStub (domain) {

  interceptor.on('request', function (key, options) {
    if (key !== domain) return;
    delete options.port;
    delete options.host;
    delete options.hostname;
    delete options.href;

    options.port = port;
    options.headers = options.headers || {};
    options.headers.host = domain;
  });

  var server = http.createServer();

  var port;

  freeport(function (err, p) {
    port = p;
    server.listen(port);
  });

  return server;
}

module.exports = HttpStub;