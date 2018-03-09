var bunyan = require('bunyan');
var cookieParser = require('cookie-parser');
var express = require('express');
var httpProxy = require('http-proxy');
var objectPath = require('object-path');
var path = require('path');
var url = require('url');

// config variables
var PORT = process.env.PORT || 5000;

// express
var app = express();
app.use(cookieParser());

// proxy
var proxy = httpProxy.createProxy();

// logging
var log = bunyan.createLogger({name: 'rwd-preview'});

// set up handlebars rendering
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// preview route
app.get('/preview', function(req, res) {

  var destUrl = req.query.url || 'http://localhost:8080';

  // save the preview hostname to the cookie
  var urlObj = url.parse(destUrl);
  var destHost = urlObj.protocol + '//' + urlObj.host;
  var destPath = addCacheBustParam(urlObj.path);
  res.cookie('rwdPreviewHost', destHost);

  var context = {
    serverHost: req.protocol + '://' + req.get('host'),
    title: req.get('host'),
    host: destHost,
    path: destPath,
    screens: [
      {name: 'base', minWidth: 320, maxWidth: 374, height: 480, scale: true},
      {name: 'phone-small', minWidth: 375, maxWidth: 479, height: 667, scale: true},
      {name: 'phone', minWidth: 480, maxWidth: 567, height: 320, scale: true},
      {name: 'phone-large', minWidth: 568, maxWidth: 666, height: 320, scale: true},
      {name: 'tablet-small', minWidth: 667, maxWidth: 767, height: 375},
      {name: 'tablet', minWidth: 768, maxWidth: 899, height: 1024},
      {name: 'tablet-large', minWidth: 900, maxWidth: 1023, height: 1024},
      {name: 'desktop-small', minWidth: 1024, maxWidth: 1199, height: 768},
      {name: 'desktop', minWidth: 1200, maxWidth: 1399, height: 1000},
      {name: 'desktop-large', minWidth: 1400, maxWidth: '2000', height: 1000}
    ]
  };
  return res.render('preview', context);
});

// catchall goes to the proxy
app.get('*', function(req, res) {

  log.info({protocol: req.protocol, baseUrl: req.baseUrl, hostname: req.hostname, ip: req.ip, method: req.method}, 'Incoming request');

  var destHost = req.cookies.rwdPreviewHost;

  if (!destHost) {
   return res.send('URL to preview not specified');
  }

  var destPath = addCacheBustParam(req.originalUrl);
  var target = destHost + destPath;
  log.info({
      requestUrl: req.protocol + '://' + req.get('host') + req.originalUrl,
      target: target
    }, 'Proxy destination');

  return proxy.web(req, res, {
    target: target,
    ignorePath: true,   // manually added already
    changeOrigin: true,
    hostRewrite: true
  });
});

app.listen(PORT);

log.info('RWD-PREVIEW: Started on port ' + PORT);


// set path with initial cache-busting url parameter for iframe caching on the browser (e.g. Chrome)
function addCacheBustParam(path) {
  var urlObj = url.parse(path);
  path = urlObj.path;
  if (path.indexOf('rwdPreview=') !== -1) {
    return path;
  }
  return path + (path.indexOf('?') === -1 ? '?' : '&') + 'rwdpreview=' + (new Date()).getTime();
}

