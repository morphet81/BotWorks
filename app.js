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
    appId: '1acda086-2dbe-4d12-8690-a4b19a8985f2',
    appPassword: 'PJN3jkngKiucpUMgzaxkmFz'
});

var bot = new builder.UniversalBot(connector);

server.post('/api/message', connector.listen());

bot.dialog('/', function(session) {
    session.send('Hello World');
});