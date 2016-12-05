require('dotenv-extended').load();

var express     = require('express'),
    builder     = require('botbuilder'),
    connector   = require('botbuilder-wechat-connector'),
    util        = require('util');

// Create http server
var app    = express();

// Main dialog with LUIS
var englishRecognizer = new builder.LuisRecognizer(process.env.LUIS_EN_MODEL_URL);
var chineseRecognizer = new builder.LuisRecognizer(process.env.LUIS_CN_MODEL_URL);

// Create wechat connector
var wechatConnector = new connector.WechatConnector({
    appID: 'wxc684e65175be456e',
    appSecret: 'fe7e6e25584e218ed86499171bf0a421',

    appToken: 'phoceisdev2token',
    appID: 'wxc684e65175be456e',
    encodingAESKey: 'gkLTYN1OZ5sYHeWnROB0FbyOuFtNhHErcJQozpN6ZrQ'
});

var bot = new builder.UniversalBot(wechatConnector);

var intents = new builder.IntentDialog({ recognizers: [englishRecognizer, chineseRecognizer] })
    .matches('GetPhoceisSize', (session, args) => {
        session.send("There are currently 7 Phoceis team members");
    })
    .matches('GetPhoceisLocation', (session, args) => {
        session.send("Phoceis Asia is located in Shanghai, 655 Changhua Road");
    })
    .matches(/^GetPhoceisLocationCN/i, (session) => {
        session.send("Phoceis Asia is located in Shanghai, 655 Changhua Road");
    })
    .matches('GetPhoceisLocationCN', (session, args) => {
        session.send("Yep, c'est loupé.....");
    })
    .matches('GetBeerDay', (session, args) => {
        session.send("Beer day is on Friday. Don't hesitate to ask Crystal for your favorite beer!");
    })
    .matches('Help', builder.DialogAction.send('Hi! Try asking me things like \'search hotels in Seattle\', \'search hotels near LAX airport\' or \'show me the reviews of The Bot Resort\''))
    .onDefault((session) => {
        session.send(util.inspect(session));
        // session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
    });

// Bot dialogs
bot.dialog('/', intents);
// bot.dialog('/', [
//     function (session) {
//         session.send("All right, ");
//         // if (session.userData && session.userData.name) {
//         //     if (session.message.attachments &&
//         //         session.message.attachments.length > 0) {
//         //         var atm = session.message.attachments[0];
//         //         if (atm.contentType == connector.WechatAttachmentType.Image) {
//         //             var msg = new builder.Message(session).attachments([atm]);
//         //             session.send(msg);
//         //         }
//         //     }
//         //     session.send("How are you, " + session.userData.name);
//         // } else {
//         //     builder.Prompts.text(session, "What's your name?");
//         // }
//     },
//     function (session, results) {
//         // session.userData.name = results.response;
//         // session.send("OK, " + session.userData.name);
//         // builder.Prompts.text(session, "What's your age?");
//     },
//     function (session, results) {
//         // session.userData.age = results.response;
//         // session.send("All right, " + results.response);
//     }
// ]);

app.use('/wechat', wechatConnector.listen());

app.get('*', function(req, res) {
    console.log('salut tous');
    res.send(200, 'Hello Wechat Bot');
});

// Start listen on port
app.listen(process.env.port || 9090, function() {
    console.log('server is running.');
});