var http = require('http');
var port = process.env.port || 1337;

var express = require('express');
var http = require('http');
var app = express();
var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');


var helpers = {
	hasLength: function (v1) {
		if (!!v1 && v1.length) {
			return options.fn(this);
		}
		else {
			options.inverse(this);
		}
	}
};




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
			else {
				var message = data.join("");
				successCallback(false);
			}
        });
    }).on('error', function (nack) {
        successCallback(false);
    });
    
    ravenReq.write(JSON.stringify(ravendoc));
    ravenReq.end();
}

function getTournaments(databaseName, successCallback, failCallback) {
	var ravenReq = http.request({ host: "localhost", port: 8080, path: "/databases/" + databaseName + "/docs?startsWith=tournament", method: "GET" }, function (ack) {
		

		var data = [];
		ack.on('data', function (chunk) {
			data.push(chunk);
		});
		ack.on('end', function (param) {
			var tournamentsJson = data.join("");
			if (!tournamentsJson || tournamentsJson.length == 0) {
				failCallback();
			}
			var tournaments = JSON.parse(tournamentsJson);			
			successCallback(tournaments);			
		});
	}).on('error', function (nack) {
		failCallback();
	});	
	ravenReq.end();
}

app.get('/', function (req, res) {
    
    ensureDatabaseExists("tournament", function (status) {
		if (status != 200) {
			createNewDatabase("tournament", function (success) {
				if (success) {
					getTournaments("tournament", function (tournaments) {
						res.render("home", { isValid: true, tournaments:tournaments , helpers:helpers });
					}, function () {
						res.render("home", { isValid: true });
					});
				}
				else {
					res.render("home", { isValid: success });
				}
			});						
        }
		else if (status == 200) {
			getTournaments("tournament", function (tournaments) {
				res.render("home", { isValid: true, tournaments: tournaments.map(function (tournament) { return tournament['@metadata']['@id'];}) , helpers: helpers });
			}, function () {
				res.render("home", { isValid: true });
			});
		}
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

    //players = shuffle(players);

	var levels = [];
	var levelMatches = [];
	levels.push({ level: 0, matches: levelMatches });
	
    var closetPowerOf2 = Math.pow(2, Math.ceil(Math.log(players.length) / Math.log(2)));
    for (var i = 0; i < players.length; i++) {
        if (i < closetPowerOf2 / 2) {
			levelMatches.push({ players: [players[i], players [i + 1]], state: 'Not Resolved' });
            i++;
        } else {
			levelMatches.push({ players: [players[i], {id:-1,name:"n/a",isFake:true}], state: players[i] });
        }
    }
    tournament.levels = levels;

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
function getTournament(id,successCallback, failureCallback) {
	var ravenReq = http.request({ host: "localhost", port: 8080, path: "/databases/tournament/docs/" + id, method: "GET" }, function (ack, resp) {
		var data = [];
		ack.on('data', function (chunk) {
			data.push(chunk);
		});
		ack.on('end', function () {
			if (!!data && data.length > 0) {
				result = JSON.parse(data.join(''));
				successCallback(result);
			}
			else
				failureCallback();
		});
	}).on('error', function (nack) {
		failureCallback();
	});
	ravenReq.end();
}

function saveTournament(id,tournament, successCallback, failureCallback) {
	var ravenReq = http.request({ host: "localhost", port: 8080, path: "/databases/tournament/docs/" + id, method: "PUT" }, function (ack, resp) {
		var data = [];
		ack.on('data', function (chunk) {
			data.push(chunk);
		});
		ack.on('end', function () {
			if (ack.statusCode == 200|| ack.statusCode == 201) {
				successCallback();
			}
			else
				failureCallback();			
		});
	}).on('error', function (nack) {
		failureCallback();
	});
	ravenReq.write(JSON.stringify(tournament));
	ravenReq.end();
}

app.get('/tournament/*', function (req, res) {
    var id = req.params[0];
	var result = null;
	
	if (!!req.query.level) {
		getTournament(id, function (result) {
			var winner = result.levels[req.query.level].matches[req.query.match].players.find(function (x,i,a) {
				return x.id.toString() === req.query.winner;
			});
			result.levels[req.query.level].matches[req.query.match].state = winner;
			saveTournament(id, result, function () { res.render("tournament", { id: id, tournament: result }); }, function () { res.redirect("new" + result.Key); });
			
		}, function () {
			res.redirect("/");
		});
	} else {
		getTournament(id, function (result) { res.render("tournament", { id: id, tournament: result }); }, function () { res.redirect("/"); });
		
	}    
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