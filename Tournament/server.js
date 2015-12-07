var http = require('http');
var port = process.env.port || 1337;

var express = require('express');
var http = require('http');
var app = express();
var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

function ensureDatabaseExists(databaseName, successCallback, failureCallback){
    var getDatabase = http.request({ host: "localhost", port: 8080, path: "/databases/" + encodeURIComponent("<system>") + "/docs/Raven/Databases/"+ databaseName, method: "GET" }, function (ack) {
        var getData = [];
        ack.on('data', function (chunk) {
            getData.push(chunk);
        });
        ack.on('end', function (param) {
            var dataString = getData.join('');
            successCallback(ack.statusCode);
        });
    }).on('error', function (nack) {
        failureCallback
    });
    getDatabase.end();
}

function createNewDatabase(databaseName, successCallback){
    var ravendoc = { SecuredSettings: {}, Settings: { "Raven/DataDir": "~/"+ databaseName}, "Disabled": false, Id: databaseName };
    var ravenReq = http.request({ host: "localhost", port: 8080, path: "/admin/databases/"+ databaseName, method: "PUT" }, function (ack) {
        var data = [];
        ack.on('data', function (chunk) {
            data.push(chunk);
        });
        ack.on('end', function (param) {            
            if (!!data && data.length == 0)
                successCallback(true);
            else
                successCallback(false);
        });
    }).on('error', function (nack) {
        successCallback(false);
    });
    
    ravenReq.write(JSON.stringify(ravendoc));
    ravenReq.end();
}

app.get('/', function (req, res) {
    
    ensureDatabaseExists("tournament", function (status) {
        if (status!= 200) {
            createNewDatabase("tournament",  function (success) { res.render("home", { isValid: success}); })
           
        }
        else if (status == 200)
            res.render("home", { isValid: true });
        else
            res.render("home", { isValid: false });
    }, 
        function () {
        res.render("home", { isValid: false });
    });
    
    
});

app.get('/new', function (req, res) {
	var tournament = {
		name: "",
		createdAt: "",
        fetchPlayersFrom: "",
        matches: [],
        isFinished:false
    };
    
    var players = [
        { id: 1, name: "fitzchak" }, 
        { id: 2, name: "Adi" }, 
        { id: 3, name: "hila" }, 
        { id: 4, name: "Maxim" },
        { id: 5, name: "A" },
        { id: 6, name: "B" },
        { id: 7, name: "C" },
        { id: 8, name: "F" },
        { id: 9, name: "D2" },
        { id: 10, name: "Fsd" },
        { id: 11, name: "Gd" }
    ];

    players = shuffle(players);

    var matches = [];
    var closetPowerOf2 = Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2)));
    for (var i = 0; i < players.length; i++) {
        if (i < closetPowerOf2 / 2) {
            matches.push([players[i], players[i + 1]]);
            i++;
        } else {
            matches.push([players[i], null]);
        }
    }
    tournament.matches = matches;

	ravenReq = http.request({ host: "localhost", port: 8080, path: "/databases/tournament/docs/tournament/", method: "PUT" }, function (ack, resp) {
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

function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    
    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        
        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    
    return array;
}

app.get('/tournament/*', function (req, res) {
    var id = req.params[0];
    var result = null;
    var ravenReq = http.request({ host: "localhost", port: 8080, path: "/databases/tournament/docs/"+ id, method: "GET" }, function (ack, resp) {
        var data = [];
        ack.on('data', function (chunk) {
            data.push(chunk);
        });
        ack.on('end', function () {
            result = JSON.parse(data.join(''));
            res.render("tournament", { id: id });
        });
    }).on('error', function (nack) {
        res.redirect("new" + result.Key);
    });
    ravenReq.end();
});

var server = app.listen(port, function () {
	var host = server.address().address;
	var port = server.address().port;
	
	console.log('Example app listening at http://%s:%s', host, port);
});

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