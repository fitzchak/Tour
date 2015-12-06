var http = require('http');
var port = process.env.port || 1337;

var express = require('express');
var http = require('http');
var app = express();
var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.get('/', function (req, res) {
	var players = [
		{ id: 1, name: "fitzchak" }, 
		{ id: 2, name: "Adi" }, { id: 3, name: "hila" }, { id: 4, name: "Maxim" }
	];

    /*for (var i = 0; i < players.length; i++) {
		var player = players[i];
		http.put("http://localhost:8080/databases/tournament/docs/");
    }*/

    res.render("home");
});

app.get('/new', function (req, res) {

	var tournament = {
		id="tournament/"
		name: "",
		createdAt: "",
		fetchPlayersFrom: ""
    };
	
	var ravenReq = http.request({ host: "localhost", port: 8080, path: "/databases/tournament/docs", method: "PUT" }, function (ack, resp) {
	    var data = [];
		ack.on('data', function (chunk) {
		    data.push(chunk);
	        
		});
		ack.on('end', function () {
		    var result = JSON.parse(data.join(''));
		    res.redirect("tournament/" + result.Key);
		});
	}).on('error',function(nack) {
	    res.render("new", [{ id: 1, name: "error: "+ nack.message }]);
	});
	ravenReq.write(JSON.stringify(tournament));
    ravenReq.end();
});

app.get('/tournament/:id', function (req, res) {
    var id = req.params.id;
	
	/*var players = [
		{ id: 1, name: "fitzchak" }, 
		{ id: 2, name: "Adi" }, { id: 3, name: "hila" }, { id: 4, name: "Maxim" }
		];*/

	res.render("tournament", {id: id});
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


console.log('Hello world');

createTour();
getNextStage();

var Player = ["PlayerId", "PlayerName"];

function createTour(players) {
    var testplayers = [
        ["player/1", "Name1"],
        ["player/2", "Name2"],
        ["player/3", "Name3"],
        ["player/4", "Name4"],
        ["player/5", "Name5"],
        ["player/6", "Name6"],
        ["player/7", "Name7"],
        ["player/8", "Name8"],
        ["player/9", "Name9"],
        ["player/10", "Name10"],
        ["player/11", "Name11"],
    ];
    
    var emptyPlayer = ["Empty", "Player"]
    
    players = testplayers;
    
    // random
    
    var matches = [];
    
    var count = players.length;
    var next = Math.pow(2, Math.ceil(Math.log(count) / Math.log(2)));
    
    for (var i = 0; i < count; i++) {
        if (i < next / 2) {
            matches.push([testplayers[i], testplayers[i + 1]]);
            i++;
        } else {
            matches.push([testplayers[i], emptyPlayer]);
        }
    }
    console.log("CREATE TOUR:");
    console.log(" stage = " + matches);
}

function getNextStage(players) {
    var testplayers = [
        ["player/1", "Name1"],
        ["player/3", "Name3"],
        ["player/5", "Name5"],
        ["player/7", "Name7"],
        ["player/9", "Name9"],
        ["player/10", "Name10"],
        ["player/11", "Name11"],
    ];
    
    var emptyPlayer = ["Empty", "Player"]
    
    players = testplayers;
    
    var matches = [];
    var half = players.length / 2;
    
    for (var i = 0; i < (half / 2) + 1; i++) {
        matches.push(players[i], players[players.length - i - 1])
    }
    var chk = half - Math.floor(players.length / 2);
    if (chk !== 0) {
        matches.unshift([players[Math.floor(players.length / 2)], emptyPlayer]);
    }
    
    
    console.log(" stage = " + matches);
}