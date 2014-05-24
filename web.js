/* 
	-- TODO --

	Figure out the web server bits. Currently the app doesn't run in foreman and
	on Heroku it fails to process font files
*/

// web.js
var express 		= require("express")
  , connect 		= require('connect')
  , dotenv			= require('dotenv')
  , logfmt 			= require("logfmt")
  , EventSource = require('eventsource')
  , http 			  = require('http')
  , fs   			  = require('fs')
  , util 			  = require('util')
  , url 			  = require('url')
  , cors 			  = require('cors')
  , bodyParser	= require('body-parser')
  , json 			  = require('json')
  , urlencode 	= require('urlencode')
  ;

/*======================================
=            Initialization            =
======================================*/
dotenv.load(); 

var app = express();
app.use(bodyParser() );
//app.use(express.json() );
//app.use(express.urlencoded() );
//app.use( json() );
//app.use( urlencode() );

app.use(logfmt.requestLogger());


// ES Server vars
var PORT = process.argv[2] || 8080
  , HOST = process.argv[3] || '127.0.0.1';

// Spark Credentials (temp)
var deviceID = process.env.deviceID;	// string, your device ID
var accessToken = process.env.accessToken; // string, your access token

// Spark URL - must use es.addEventListener and specify the event name
var url = "https://api.spark.io/v1/devices/"+deviceID+"/events/?access_token="+accessToken;

// Test URL - uses es.onmessage to capture events
//var url = 'https://demo-eventsource.rhcloud.com/';


/*===================================
=            EventSource            =
===================================*/
var es = new EventSource(url);

// Only fires for Test URL
es.onmessage = function(e){
  //console.log( 'onmessage: ', e.data);
};

es.onerror = function(e){
  console.log('ES Error');
};

/*================================
=            Core App            =
================================*/


// Base browser access
app.get('/', function(req, res) {  
  res.sendfile('html/index.html');
});

// Aux file server
app.get('/html/*', function(req, res){
	
	// Remove front slash, serve it up!
	var file = req.url.substr(1);
	res.sendfile( file );
});

var port = Number(process.env.PORT || 5000);

app.listen(port, function() {
  console.log("Listening on " + port);
});

/*=================================
=            ES Server            =
=================================*/ 

http.createServer(function (req, res) {
   if (req.url == '/events') {
      res.writeHead(200, { 'Content-Type'  : 'text/event-stream'
                         , 'Cache-Control' : 'no-cache'
                         , 'Connection'    : 'keep-alive'
                         , "Access-Control-Allow-Origin": "*"
                         });

      console.log('Client connect');

      // Only fires for Spark URL
	  es.addEventListener('Uptime', function(e){
	    console.log( 'listener: ', JSON.parse(e.data) );
	    
	    res.write('id: 33\n');
	    res.write('event: Soil\n');
	    res.write('data: '+e.data+'\n\n');
	  }, false);


      res.socket.on('close', function () {
         console.log('Client leave');
      });
 
   } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(fs.readFileSync(__dirname + '/templates/index.html'));
      res.end()
   }
}).listen(PORT, HOST);
	
	
