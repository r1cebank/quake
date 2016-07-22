var HTTPClient =  require('request-promise');
var MongoClient = require('mongodb').MongoClient;

var APIURI = 'http://api.p2pquake.com/v1/human-readable';
var GeocodeAPI = 'http://nominatim.openstreetmap.org/search?q=<% city %>&format=json';

MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
    console.log("Connected correctly to server");
    var collection = db.collection('quakes');
    setInterval(function() {
        HTTPClient(APIURI).then(function (response) {
            var data = JSON.parse(response);
            collection.insertMany(data, function (err, result) {
                if(result) {
                    console.log(`inserted ${result.nInserted} documents`);
                }
            });
        });
    }, 60000);
});