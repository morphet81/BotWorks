require('dotenv-extended').load();

// require('request').debug = true

var express         = require('express'),
    builder         = require('botbuilder'),
    connector       = require('morphet-botbuilder-wechat-connector'),
    util            = require('util'),
    fs              = require('fs'),
    request         = require('request'),
    wechatUtils     = require('./wechat-utils'),
    randomstring    = require("randomstring"),
    sha1            = require('sha1');

// Create http server
var app    = express();

// Make images public
app.use(express.static('./assets/img/demo'));

// Demo Payment page
app.use(express.static('./demo'));

// Get WeChat access token
app.get('/wechat_token', function(req, res) {
    wechatUtils.getAccessToken()
        .then(function(accessToken) {
            res.status(200).send(accessToken);
        })
        .catch(function (error) {
            res.status(500).send(error);
        });
});

// Get the jsapi ticket
app.get('/jsapi_ticket', function(req, res) {
    console.log(req.headers.host);

    wechatUtils.getJsapiTicket()
        .then(function(jsapiTicket) {
            // Init signature calculation variables
            var timeStamp = Date.now();
            var nonceStr = randomstring.generate();

            // Generate signature
            var signatureRoot = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timeStamp}&url=http://localhost:3978/jsapi_ticket`;
            var signature = sha1(signatureRoot);

            // Wechat JS API config
            var response = {
                debug: true,
                appId: process.env.WECHAT_APP_ID,
                timestamp: timeStamp,
                nonceStr: nonceStr,
                signature: signature,
                jsApiList: []
            };

            res.status(200).send(response);
        })
        .catch(function (error) {
            res.status(500).send(`There was an error while trying to get the jsapi ticket: ${error}`);
        });
});

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
    res.status(200).send('Hello Wechat Bot');
});

// Start listen on port
app.listen(process.env.port || 3978, function() {
    console.log('server is running');
});