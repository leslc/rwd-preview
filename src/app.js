var log = require('bunyan').createLogger({name: 'rwd-preview'});
var cookieParser = require('cookie-parser');
var express = require('express');
var path = require('path');
var previewPage = require('./pages/preview');
var proxyPage = require('./pages/proxy');

// config variables
var PORT = process.env.PORT || 8080;

// express
var app = express();
app.use(cookieParser());

// set up handlebars rendering
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// preview route
app.get('/preview', previewPage);

// all other routes goes to the proxy
app.get('*', proxyPage);

app.listen(PORT);

log.info('APP: Started on port ' + PORT);


