/**
 * Created by alexandre on 21/11/2016.
 */
//var restify = require('restify');
//var builder = require('botbuilder');
//
//var server = restify.createServer();
//server.listen(process.env.PORT || 3000, function (){
//    console.log('%s listening to %s', server.name, server.url);
//});
//
//var connector = new builder.ChatConnector({
//    appId: '1acda086-2dbe-4d12-8690-a4b19a8985f2',
//    appPassword: 'PJN3jkngKiucpUMgzaxkmFz'
//});
//
//var bot = new builder.UniversalBot(connector);
//
//server.post('/api/message', connector.listen());
//
//bot.dialog('/', function(session) {
//    session.send('Hello World');
//});

// Load the http module to create an http server.
var http = require('http');

// Configure our HTTP server to respond with Hello World to all requests.
var server = http.createServer(function (request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.end("Hello World\n");
});

// Listen on port 8000, IP defaults to 127.0.0.1
server.listen(process.env.PORT || 3000);

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:3000/");