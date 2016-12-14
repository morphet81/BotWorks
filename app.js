require('dotenv-extended').load();

var express             = require('express'),
    builder             = require('botbuilder'),
    botbuilderWechat    = require('botbuilder-wechat-connector');

// Create the app
var app    = express();

// Create the dialog
var dialog = [
    function (session) {
        builder.Prompts.text(session, 'Hello! What is your name?');
    },
    function (session, result) {
        session.send(`Hi ${result.response}! Nice to meet you.`);
    }
];

// Configure Bot Framework's bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);
bot.dialog('/', dialog);
app.use('/api/messages', connector.listen());

// Configure WeChat's bot
var wechatConnector = new botbuilderWechat.WechatConnector({
    appToken: process.env.WECHAT_TOKEN,
    appID: process.env.WECHAT_APP_ID,
    encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY
});
var wechatBot = new builder.UniversalBot(wechatConnector);
wechatBot.dialog('/', dialog);
app.use('/wechat', wechatConnector.listen());

// Default app page
app.get('*', function(req, res) {
    res.send(200, 'Hello Wechat Bot');
});

// Start listening on port
app.listen(process.env.port || 3978, function() {
    console.log('server is running');
});