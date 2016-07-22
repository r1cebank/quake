var HTTPClient =  require('request-promise');
var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var app = express();

var port = process.env.PORT || 3939;
var APIURI = 'http://api.p2pquake.com/v1/human-readable';
var GeocodeAPI = 'http://nominatim.openstreetmap.org/search?q=<% city %>&format=json';

MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
    console.log("Connected correctly to server");
    var collection = db.collection('quakes');
    setInterval(function() {
        HTTPClient(APIURI).then(function (response) {
            var data = JSON.parse(response);
            collection.insertMany(data, function (err, result) {
                if(!!result.nInserted) {
                    console.log(`inserted ${result.nInserted} documents`);
                }
            });
        });
    }, 60000);
});

app.get('/', function (req, res) {
    res.send('pong');
});

app.listen(port, function () {
    console.log(`Example app listening on port ${port}!`);
});

/// PING
var http = require("http");
setInterval(function() {
    http.get('http://quake.herokuapp.com/');
}, 300000); // every 5 minutes (300000)
