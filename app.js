var http = require('http'),
    httpProxy = require('http-proxy');

httpProxy.createServer(8081, 'localhost').listen(8083);
