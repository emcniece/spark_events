// web.js
var express 		= require("express")
  , logfmt 			= require("logfmt")
  , EventSource 	= require('eventsource')
  , http 			= require('http')
  , fs   			= require('fs')
  , url 			= require('url')
  , cors 			= require('cors')
  , bodyParser		= require('body-parser')
  , json 			= require('json')
  , urlencode 		= require('urlencode')
  , swagger 		= require('swagger-node-express')
  , swmodels		= require('./swagger-models.js')
  ;

/*======================================
=            Initialization            =
======================================*/

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

/*=============================================
=            Swagger Documentation            =
=============================================*/

// Couple the application to Swagger
swagger.setAppHandler(app);
swagger.addModels(swmodels);

// Add models and methods to swagger
swagger.addModels(models)
  .addGet(petResources.findById)
  .addGet(petResources.findByTags)
  .addGet(petResources.findByStatus)
  .addPost(petResources.addPet)
  .addPut(petResources.updatePet)
  .addDelete(petResources.deletePet);

swagger.configureDeclaration("pet", {
  description : "Operations about Pets",
  authorizations : ["oauth2"],
  produces: ["application/json"]
});

// set api info
swagger.setApiInfo({
  title: "Swagger Sample App",
  description: "This is a sample server Petstore server. You can find out more about Swagger at <a href=\"http://swagger.wordnik.com\">http://swagger.wordnik.com</a> or on irc.freenode.net, #swagger.  For this sample, you can use the api key \"special-key\" to test the authorization filters",
  termsOfServiceUrl: "http://helloreverb.com/terms/",
  contact: "apiteam@wordnik.com",
  license: "Apache 2.0",
  licenseUrl: "http://www.apache.org/licenses/LICENSE-2.0.html"
});

swagger.setAuthorizations({
  apiKey: {
    type: "apiKey",
    passAs: "header"
  }
});

// Configures the app's base path and api version.
swagger.configureSwaggerPaths("", "api-docs", "")
swagger.configure("http://localhost:8002", "1.0.0");

/*
// Serve up swagger ui at /docs via static route
var docs_handler = express.static(__dirname + '/../../swagger-ui/');
app.get(/^\/docs(\/.*)?$/, function(req, res, next) {
  if (req.url === '/docs') { // express static barfs on root url w/o trailing slash
    res.writeHead(302, { 'Location' : req.url + '/' });
    res.end();
    return;
  }
  // take off leading /docs so that connect locates file correctly
  req.url = req.url.substr('/docs'.length);
  return docs_handler(req, res, next);
});
*/

// Start the server on port 8002
app.listen(8002);


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
	    //res.write( JSON.parse(e.data) );
	    res.write('id: 33\n');
	    res.write('event: Soil\n');
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
	
	
