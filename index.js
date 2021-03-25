const freeport = require('freeport');
const interceptor = require('./interceptor');
const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');
const fs = require('fs');
const { getAvailablePortForUse } = require('./portScannerUtility');

const DEFAULT_MIN_AVAILABLE_PORT = 3000;
const DEFAULT_MAX_AVAILABLE_PORT = 4000;

function handle(domain, request) {
  const hostname = request.hostname || request.host;
  return hostname && hostname.split(':')[0] === domain;
}

/**
 * 
 * @param {string} domain The domain to stub
 * @param {boolean} options.useNewPortScanner Use the new port scanner instead of Freeport (legacy port scanner utility)
 * @param {number=3000} options.minPortNumber The minimun port number to use. Defaults to 3000, only used by new port scanner
 * @param {number=4000} options.maxPortNumber The maximum port number to use. Defaults to 4000, only used by new port scanner
 * @returns http.Server
 */
function HttpStub (domain, options = { useNewPortScanner : false }) {
  let port, https_port;

  const server = http.createServer();
  let https_server;

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


  if (!options.minPortNumber) {
      options.minPortNumber  = DEFAULT_MIN_AVAILABLE_PORT;
  }

  if (!options.maxPortNumber) {
    options.maxPortNumber = DEFAULT_MAX_AVAILABLE_PORT;
  }

  const portScanner = !!options.useNewPortScanner ? getAvailablePortForUse(options.minPortNumber, options.maxPortNumber) : freeport;
  const proxyServerPort = !!options.useNewPortScanner ? getAvailablePortForUse(options.maxPortNumber + 1, options.maxPortNumber + 1000) : freeport;

  portScanner(function (err, p) {
    port = p;
    server.listen(port);
  });

  proxyServerPort(function (err, p) {
    https_port = p;

    const proxy = httpProxy.createProxyServer();

    https_server = https.createServer({
      key: fs.readFileSync(__dirname + '/server.key'),
      cert: fs.readFileSync(__dirname + '/server.crt')
    }, function (req, res) {
      proxy.web(req, res, { target: 'http://localhost:' + port });
    });

    https_server.listen(https_port);
  });

  const close = server.close;

  server.close = function () {
    interceptor.removeListener('request', swap);
    https_server.close();
    close.apply(server, arguments);
  };

  return server;
}

module.exports = HttpStub;