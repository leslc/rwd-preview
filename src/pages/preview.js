var log = require('bunyan').createLogger({name: 'rwd-preview'});
var url = require('url');

module.exports = function(req, res) {

  var requestedUrl = req.query.url || req.cookies.rwdPreviewHost || 'http://www.google.com';

  // make sure url starts with "http://" "https://" or "//""
  if (!requestedUrl.match(/^(https?:)?\/\//)) {
    requestedUrl = 'http://' + requestedUrl;
  }

  log.info({url: req.originalUrl, queryUrl: req.query.url}, 'PREVIEW-PAGE: Page requested');

  // this server's domain (may change depending on where deployed)
  var proxyDomain = req.protocol + '://' + req.get('host');

  // requestedURL read from URL query string or rwdPreviewHost cookie
  requestedUrl = url.parse(requestedUrl);
  var originalDomain = requestedUrl.protocol + '//' + requestedUrl.host; // protocol returns ':' here
  var path = requestedUrl.path;

  // set cookie for proxy middleware to use
  if (originalDomain !== req.cookies.rwdPreviewHost) {
    res.cookie('rwdPreviewHost', originalDomain);
    log.info({originalDomain: originalDomain}, 'PREVIEW-PAGE: Set rwdPreviewHost cookie');
  }

  var context = {
    proxyDomain: proxyDomain,
    originalDomain: originalDomain,
    path: path,
    inputSize: (originalDomain + path).length,
    screens: [
      {name: 'base', minWidth: 320, maxWidth: 374, height: 460, ppi: 326 / 2 },         // divide by 2 for retina
      {name: 'phone-small', minWidth: 375, maxWidth: 479, height: 667, ppi: 326 / 2 },
      {name: 'phone', minWidth: 480, maxWidth: 567, height: 320, ppi: 326 / 2 },
      {name: 'phone-large', minWidth: 568, maxWidth: 666, height: 320, ppi: 326 / 2 },
      // {name: 'iPhone7plus', minWidth: 414, maxWidth: 414, height: 736, ppi: 401 / 3 },       // divide by 3 for iphone7, need to downsample 0.96 for this to work
      {name: 'tablet-small', minWidth: 667, maxWidth: 767, height: 375, ppi: 264 / 2 },
      {name: 'tablet', minWidth: 768, maxWidth: 899, height: 1024, ppi: 264 / 2},
      {name: 'tablet-large', minWidth: 900, maxWidth: 1023, height: 1024, ppi: 264 / 2 },
      {name: 'desktop-small', minWidth: 1024, maxWidth: 1199, height: 768},
      {name: 'desktop', minWidth: 1200, maxWidth: 1399, height: 1000},
      {name: 'desktop-large', minWidth: 1400, maxWidth: '2000', height: 1000}
    ]
  };

  log.info({originalDomain: originalDomain, path: path, proxyDomain: proxyDomain}, 'PREVIEW-PAGE: Page loaded');

  res.render('../views/preview', context);
};

