var freeport = require('freeport');
var interceptor = require('./interceptor');
var http = require('http');
var https = require('https');
var httpProxy = require('http-proxy');
var fs = require('fs');

function handle(domain, request) {
  var hostname = request.hostname || request.host;
  return hostname && hostname.split(':')[0] === domain;
}

function HttpStub (domain) {
  var port, https_port;

  var server = http.createServer();
  var https_server;

  function swap (request) {
    if (!handle(domain, request)){
      return;
    }

    delete request.host;
    delete request.hostname;

    if (request._https_stub) {
      request.port =  https_port;
      request.rejectUnauthorized = false;
      request.requestCert = true;
      request.agent = false;
    } else {
      request.port =  port;
    }

    request.headers = request.headers || {};
    request.headers.host = domain;

  }

  interceptor.on('request', swap);


  freeport(function (err, p) {
    port = p;
    server.listen(port);
  });

  freeport(function (err, p) {
    https_port = p;

    var proxy = httpProxy.createProxyServer();

    https_server = https.createServer({
      key: fs.readFileSync(__dirname + '/server.key'),
      cert: fs.readFileSync(__dirname + '/server.crt')
    }, function (req, res) {
      proxy.web(req, res, { target: 'http://localhost:' + port });
    });

    https_server.listen(https_port);
  });

  var close = server.close;

  server.close = function () {
    interceptor.removeListener('request', swap);
    https_server.close();
    close.apply(server, arguments);
  };

  return server;
}

module.exports = HttpStub;