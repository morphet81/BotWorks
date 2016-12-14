require('dotenv-extended').load();

// require('request').debug = true

var express         = require('express'),
    builder         = require('botbuilder'),
    connector       = require('botbuilder-wechat-connector'),
    // connector       = require('./wechat'),
    util            = require('util'),
    fs              = require('fs');

// require('request').debug = true

// Create http server
var app    = express();

// Create wechat connector
var wechatConnector = new connector.WechatConnector({
    appID: process.env.WECHAT_APP_ID,
    appSecret: process.env.WECHAT_APP_SECRET,
    appToken: process.env.WECHAT_TOKEN,
    encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY
});

// Internal modules
var holiday = require('./holiday')(wechatConnector);
var phoceis = require('./phoceis')(wechatConnector);
var welcome = require('./welcome')('/phoceis');
var preprocessor = require('./preprocessor')(wechatConnector);

var defaultDialog = holiday.dialog;

/**********-**************/
/******  WECHAT BOT  *****/
/**********-**************/

// Build the WeChat bot
var bot = new builder.UniversalBot(
    wechatConnector,
    {
        localizerSettings: {
            botLocalePath: "./locale",
            defaultLocale: "en"
        }
    }
);

// Pre-treatment of the message
bot.use({
    botbuilder: preprocessor.Core
});

// Bot dialogs
bot.dialog('/', defaultDialog);
bot.dialog('/holiday', holiday.dialog);
bot.dialog('/phoceis', phoceis.dialog);
welcome.initDialogs(bot);

app.use('/wechat', wechatConnector.listen());

/************-****************/
/******  MICROSOFT BOT   *****/
/************-****************/

var microsoftConnector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var microsoftBot = new builder.UniversalBot(
    microsoftConnector,
    {
        localizerSettings: {
            botLocalePath: "./locale",
            defaultLocale: "en"
        }
    }
);

// Bot dialogs
microsoftBot.dialog('/', defaultDialog);
microsoftBot.dialog('/holiday', holiday.dialog);
microsoftBot.dialog('/phoceis', phoceis.dialog);
welcome.initDialogs(microsoftBot);

// Pre-treatment of the message
microsoftBot.use({
    botbuilder: preprocessor.Core
});

app.use('/microsoft', microsoftConnector.listen());

/***************-*******************/
/******     START LISTENING   ******/
/***************-*******************/

app.get('*', function(req, res) {
    res.send(200, 'Hello Wechat Bot');
});

// Start listen on port
app.listen(process.env.port || 3978, function() {
    console.log('server is running');
});