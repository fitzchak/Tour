var http = require('http');
var port = process.env.port || 1337;

var express = require('express');
var app = express();

app.get('/', function (req, res) {
	var players = ["fitzchak", "fff"];

    var tourmanent = [["a"]];

	res.send('Hello World!');
});

var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log('Example app listening at http://%s:%s', host, port);
});

/*http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello Worfld\n');
}).listen(port);*/