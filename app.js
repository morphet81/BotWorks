/**
 * Created by alexandre on 21/11/2016.
 */
var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(process.env.PORT || 3000, function (){
    console.log('%s listening to %s', server.name, server.url);
});

var connector = new builder.ChatConnector({
    appId: '',
    appPassword: ''
});

var bot = new builder.UniversalBot(connector);

server.post('/api/message', connector.listen());

bot.dialog('/', function(session) {
    session.send('Hello World');
});