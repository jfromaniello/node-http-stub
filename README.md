Create an instance of http server that catches all requests to a given host.

This is useful for tests.

## Install

```
npm i http-stub
```

## Usage

```javascript
var HttpStub = require('http-stub');
var stub = HttpStub('google.com:80');

stub.on('request', function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World');
}).on('listening', function () {
  request.get('http://google.com', function (err, resp, body) {
    assert.equal(body, 'Hello World');
  });
});
```

Mount an express application:

```javascript
var HttpStub = require('http-stub');

var express = require('express');
var app = express();
app.get('/bo', function (req, res) {
  res.send('hello');
});

var stub = HttpStub('google.com:80');

stub.on('request', app);
```


## License

MIT 2015 - José F. Romaniello