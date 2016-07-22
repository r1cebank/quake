var HTTPClient =  require('request-promise');
var Promise = require('bluebird');
var utf8 = require('utf8');
var MongoClient = require('mongodb').MongoClient;
var format = require("string-template")
var express = require('express');
var app = express();

var port = process.env.PORT || 3939;
var APIURI = 'http://api.p2pquake.com/v1/human-readable';
var GeocodeAPI = 'https://maps.googleapis.com/maps/api/geocode/json?address={addr}&key=' + process.env.GOOGLE_API;

function startPulling(collection) {
    setInterval(function() {
        HTTPClient(APIURI).then(function (response) {
            var data = JSON.parse(response);
            // Filter out non earchquake activities
            data = data.filter(function (dataEntry) {
                return dataEntry.earthquake;
            });
            Promise.all(data.map(function (entry) {
                return Promise.all(entry.points.map(function (point) {
                    var url = format(GeocodeAPI, {addr: utf8.encode(point.addr)});
                    return HTTPClient(url).then(function (value) {
                        point.geocode = JSON.parse(value);
                    });
                }));
            })).then(function () {
                collection.insertMany(data, function (err, result) {
                    if(!!result.nInserted) {
                        console.log(`inserted ${result.nInserted} documents`);
                    }
                });
            });
        });
    }, 10000);
}

MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
    console.log("Connected correctly to server");
    var collection = db.collection('quakes');
    startPulling(collection);
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
