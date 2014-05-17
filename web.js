	// web.js
	var express = require("express");
	var logfmt = require("logfmt");
	var app = express();

	var EventSource = require('eventsource');
	var esInitDict = {rejectUnauthorized: false};

	// ES Server vars
	var http = require('http')
	  , fs   = require('fs')
	  , PORT = process.argv[2] || 8080
	  , HOST = process.argv[3] || '127.0.0.1';


	var deviceID = process.env.deviceID;	// string, your device ID
	var accessToken = process.env.accessToken; // string, your access token

	// Spark URL - must use es.addEventListener and specify the event name
	var url = "https://api.spark.io/v1/devices/"+deviceID+"/events/?access_token="+accessToken;

	// Test URL - uses es.onmessage to capture events
	//var url = 'https://demo-eventsource.rhcloud.com/';
console.log( ENV);
	/*===================================
	=            EventSource            =
	===================================*/
	var es = new EventSource(url);

	//// Only fires for Spark URL
	//es.addEventListener('Uptime', function(e){
	//	console.log( 'listener: ', JSON.parse(e.data) );
	//}, false);

	// Only fires for Test URL
	es.onmessage = function(e){
	  //console.log( 'onmessage: ', e.data);
	};

	es.onerror = function(){
	  console.log('ES Error');
	};

	/*================================
	=            Core App            =
	================================*/

	app.use(logfmt.requestLogger());

	app.get('/', function(req, res) {
	  res.send('Hello World!');
	});

	var port = Number(process.env.PORT || 5000);
	app.listen(port, function() {
	  console.log("Listening on " + port);
	});

	/*=================================
	=            ES Server            =
	=================================*/ 
 
	http.createServer(function (req, res) {
	   if (req.url == '/') {
	      res.writeHead(200, { 'Content-Type'  : 'text/event-stream'
	                         , 'Cache-Control' : 'no-cache'
	                         , 'Connection'    : 'keep-alive'
	                         , "Access-Control-Allow-Origin": "*"
	                         });

	      console.log('Client connect');

	      // Only fires for Spark URL
		  es.addEventListener('Uptime', function(e){
		    console.log( 'listener: ', JSON.parse(e.data) );
		    //res.write( JSON.parse(e.data) );
		    res.write('data: '+e.data+'\n\n');
		  }, false);

		/*	 
	      var t = setInterval(function () {
	         console.log('Send data');
	         //res.write('data: DATA\n\n');
	      }, 5000);
	 	*/
	      res.socket.on('close', function () {
	         console.log('Client leave');
	         clearInterval(t);
	      });
	 
	   } else {
	      res.writeHead(200, {'Content-Type': 'text/html'});
	      res.write(fs.readFileSync(__dirname + '/templates/index.html'));
	      res.end()
	   }
	}).listen(PORT, HOST);
		
		
	