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
var intents = new builder.IntentDialog();

intents.matches(/^change name/i, [
    function (session) {
        session.beginDialog('/profile');
    },
    function (session, results) {
        session.send('Ok... Changed your name to %s', session.userData.name);
    }
]);

intents.onDefault([
    function (session, args, next) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi! What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

server.post('/api/message', connector.listen());

bot.dialog('/', function(session) {
    session.send('Hello World');
});