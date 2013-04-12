
/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  http = require('http'),
  path = require('path'),
  httpProxy = require('http-proxy');

var app = express(),
  proxy = new httpProxy.RoutingProxy();

// all environments
app.set('port', process.env.PORT || 8083);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

// Proxy all forum traffic
app.all('/forums*', function (req, res) {
  proxy.proxyRequest(req, res, { host : 'localhost', port : '8081' });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
