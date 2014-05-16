// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();

var EventSource = require('eventsource');
var esInitDict = {rejectUnauthorized: false};

var deviceID = "50ff70065067545642080387";
var accessToken = "b83d8349a10a34df67f74d4afed7783851534819";

// Spark URL - must use es.addEventListener and specify the event name
var url = "https://api.spark.io/v1/devices/"+deviceID+"/events/?access_token="+accessToken;

// Test URL - uses es.onmessage to capture events
//var url = 'https://demo-eventsource.rhcloud.com/';

/*===================================
=            EventSource            =
===================================*/
var es = new EventSource(url);

es.addEventListener('Uptime', function(e){
	console.log( 'listener: ', JSON.parse(e.data) );
}, false);


es.onmessage = function(e){
  console.log( 'onmessage: ', e.data);
};

es.onerror = function(){
  console.log('ES Error');
};


/*================================
=            Core App            =
================================*/

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World!' + ENV['deviceID'] );
});

var port = Number(process.env.PORT || 5000);
app.listen(port, function() {
  console.log("Listening on " + port);
});