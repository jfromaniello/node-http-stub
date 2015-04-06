var HttpStub = require('../');
var request = require('request');
var assert = require('assert');

describe('http-stub', function () {

  it('should work with http', function (done) {
    var stub = HttpStub('google.com');

    stub.on('request', function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World');
    }).on('listening', function () {
      request.get('http://google.com', function (err, resp, body) {
        if (err) return done(err);
        assert.equal(body, 'Hello World');
        stub.close();
      });
    }).on('close', function () {
      //it should not catch this request;
      request.get('http://google.com', function (err, resp, body) {
        if (err) return done(err);
        assert.notEqual(body, 'Hello World');
        done();
      });
    });

  });

  it('should work with https', function (done) {
    var stub = HttpStub('google.com');

    stub.on('request', function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Hello World');
    }).on('listening', function () {
      request.get('https://google.com', function (err, resp, body) {
        if (err) return done(err);
        assert.equal(body, 'Hello World');
        stub.close();
      });
    }).on('close', function () {
      request.get('http://google.com', function (err, resp, body) {
        if (err) return done(err);
        assert.notEqual(body, 'Hello World');
        done();
      });
    });

  });

});