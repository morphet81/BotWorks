//import { BingSpeechClient, VoiceRecognitionResponse } from 'bingspeech-api-client';

require('dotenv-extended').load();

var express         = require('express'),
    builder         = require('botbuilder'),
    connector       = require('botbuilder-wechat-connector'),
    spellService    = require('./spell-service'),
    util            = require('util'),
    fs              = require('fs'),
    guid            = require('guid'),
    base64          = require('base-64'),
    bingSpeech      = require('bingspeech-api-client'),
    request         = require('request'),
    FfmpegCommand   = require('fluent-ffmpeg'),
    exec            = require('child_process').exec;

let subscriptionKey = 'cf5b5c31f63449d4917e0b1e5a8ce752';
let speechClient = new bingSpeech.BingSpeechClient(subscriptionKey);

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






var isWin = /^win/.test(process.platform);
var cmd = 'ffmpeg -y -i ./tmp/test.amr ./tmp/test.wav';

console.log(isWin ? "WINDOWS" : "UNIX");

if(isWin) {
    cmd = '.\\assets\\ffmpeg\\ffmpeg -y -i .\\tmp\\test.amr .\\tmp\\test.wav';
}

console.log('Will execute commange "%s"', cmd);
exec(cmd, function(error, stdout, stderr) {
    console.log('======   ' + stdout);
    if(error) {
        console.log("There was an error " + error);
    }
});

// var command = new FfmpegCommand();
//
// FfmpegCommand('/tmp/test.amr')
//     .save('/tmp/test.wav')
//     .on('stderr', function(stderrLine) {
//         console.log('Stderr output: ' + stderrLine);
//     });

// require('request-debug')(request);

// let wav = fs.readFileSync('assets/sounds/hello_alex.wav');
let wav = fs.readFileSync('tmp/test.wav');
speechClient.recognize(wav)
    .then(response => {
        console.log(response.results[0].name);
    });


const requestToken = {
    url: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
    headers: {
        "Ocp-Apim-Subscription-Key": 'cf5b5c31f63449d4917e0b1e5a8ce752',
        "Content-Length": 0
    }
};

wechatConnector.wechatAPI.getMedia('bELszyADztXmQ5DdbJkv4hobtUgzDX6HifbEmZ4lXsW1fdgC_c9MZ6PxiHepu-a-', function (arg, data, response) {
    console.log(data);

    fs.writeFile("./tmp/test.amr", data, function(err) {
        if(err) {
            return console.log(err);
        }

        console.log("The file was saved to AMR");
    });
});

request.post(requestToken, (error, response, body) => {
    // Building the request
    const requestRecognition = {
        url: 'https://speech.platform.bing.com/recognize',
        headers: {
            "Authorization": 'Bearer ' + base64.encode(body),
            'Content-Type': 'audio/wav'
        },
        qs: {
            version: '3.0',
            requestid: guid.raw(),
            appid: process.env.BING_APP_ID,
            format: 'json',
            locale: 'en-US',
            'device.os': 'Android',
            scenarios: 'ulm',
            instanceid: guid.raw()          // TODO: change that. should be unique per device
        },
        data: wav
    };

    request.post(requestRecognition, (error, response, body) => {
        console.log(body);
    });
});















// Initialize regularly used WeChat medias
var bestTeamMatePicture;
wechatConnector.wechatAPI.uploadMedia('./assets/img/nespresso.jpeg', 'image', function(arg, fileInformation) {
    bestTeamMatePicture = fileInformation.media_id;
});

// Build the bot
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
    .matches('GetBestTeamMate', (session, args) => {

        var msg = new builder.Message(session).attachments([
            {
                contentType: 'wechat/image',
                content: {
                    mediaId: bestTeamMatePicture
                }
            }
        ]);
        session.send(msg);
        session.send('Please meet our best team mate! Always there when energy is decreasing a bit!')
    })
    .matches('Help', builder.DialogAction.send('Hi! Try asking me things like \'search hotels in Seattle\', \'search hotels near LAX airport\' or \'show me the reviews of The Bot Resort\''))
    .onDefault((session) => {
        session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
    });

if (process.env.IS_SPELL_CORRECTION_ENABLED == "true") {
    bot.use({
        botbuilder: function (session, next) {
            var message = session.message;

            console.log(util.inspect(session.message.address.user));

            var treatedAttachments = false;

            if(message.attachments) {
                console.log('Message has %d attachments', message.attachments.length);
                for (var i = 0; i < message.attachments.length ; i++) {
                    var attachment = message.attachments[i];
                    if(attachment.contentType == connector.WechatAttachmentType.Voice) {
                        console.log('Voice with id %s uploaded', attachment.content.mediaId);
                        treatedAttachments = true;
                        wechatConnector.wechatAPI.getMedia(attachment.content.mediaId, function (arg, data, response) {
                            speechClient.recognize(data)
                                .then(response => {
                                    console.log(response.results[0].name);
                                    // console.log(response.results[0].name);
                                });
                        });
                    }
                }
            }

            if(!treatedAttachments) {
                spellService
                    .getCorrectedText(session.message.text)
                    .then(text => {
                        session.message.text = text;
                        next();
                    })
                    .catch((error) => {
                        console.error(error);
                        next();
                    });
            }
        }
    })
}

// Bot dialogs
bot.dialog('/', intents);

app.use('/wechat', wechatConnector.listen());

app.get('*', function(req, res) {
    console.log('salut tous');
    res.send(200, 'Hello Wechat Bot');
});

// Start listen on port
app.listen(process.env.port || 9090, function() {
    console.log('server is running.');
});