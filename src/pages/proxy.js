var httpProxy = require('http-proxy');
var log = require('bunyan').createLogger({name: 'rwd-preview'});

// proxy
var proxy = httpProxy.createProxy({});

proxy.on('error', function(e) {
  var badHost = e.host + (e.port ? ':' + e.port : '');
  log.error({badHost: badHost}, 'PROXY-PAGE: ERROR Failed to reach destination');
});

proxy.on('proxyRes', function(proxyRes, req, res) {
  delete proxyRes.headers['access-control-allow-origin'];
  proxyRes.headers['Access-Control-Allow-Origin'] = '*';

  delete proxyRes.headers['content-security-policy'];
  proxyRes.headers['Content-Security-Policy'] = 'upgrade-insecure-requests';

  delete proxyRes.headers['X-Frame-Options'];
  delete proxyRes.headers['x-frame-options'];
});

module.exports = function(req, res) {

    var proxiedDomain = req.cookies.rwdPreviewHost;
    var target = proxiedDomain + req.originalUrl;

    if (target && proxiedDomain) {

      log.info({target: target}, 'PROXY-PAGE: Destination');

      return proxy.web(req, res, {
        target: target,
        changeOrigin: true
      });
    }

    var context = {
      host: req.get('host')
    };

    res.render('../views/error', context);
};
