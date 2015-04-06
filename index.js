var freeport = require('freeport');
var interceptor = require('./interceptor');
var http = require('http');

function HttpStub (domain) {

  function swap (key, options) {
    if (key !== domain) return;
    delete options.port;
    delete options.host;
    delete options.hostname;
    delete options.href;

    options.port = port;
    options.headers = options.headers || {};
    options.headers.host = domain;
  }

  interceptor.on('request', swap);

  var server = http.createServer();

  var port;

  freeport(function (err, p) {
    port = p;
    server.listen(port);
  });

  var close = server.close;

  server.close = function () {
    interceptor.removeListener('request', swap);
    close.apply(server, arguments);
  };

  return server;
}

module.exports = HttpStub;