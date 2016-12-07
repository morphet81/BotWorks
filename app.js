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
    exec            = require('child_process').exec;

let subscriptionKey = 'cf5b5c31f63449d4917e0b1e5a8ce752';
let speechClient = new bingSpeech.BingSpeechClient(subscriptionKey);

// require('request-debug')(request);

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



// Convert a file with ffmpeg
function ffmpegConvert(input, output, callback) {
    var isWin = /^win/.test(process.platform);
    var cmd = 'ffmpeg -y -i ' + input + ' ' + output;

    console.log(isWin ? "WINDOWS" : "UNIX");

    if(isWin) {
        cmd = '.\\assets\\ffmpeg\\ffmpeg -y -i ' + input + ' ' + output;
    }

    console.log('Will execute command "%s"', cmd);
    exec(cmd, function(error, stdout, stderr) {
        callback(error, stdout, stderr, output);
    });
};

// var isWin = /^win/.test(process.platform);
// var input = isWin ? '.\\tmp\\test.amr' : './tmp/test.amr';
// var output = isWin ? '.\\tmp\\test.wav' : './tmp/test.wav';
//
// ffmpegConvert(input, output, function (error, stdout, stderr, output) {
//     if(!error) {
//         let wav = fs.readFileSync(output);
//
//         speechClient.recognize(wav)
//             .then(response => {
//                 console.log('======    ' + response.results[0].name);
//             });
//     }
//     else {
//         console.log("There was an error " + error);
//     }
// });





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
            wechatConnector.wechatAPI.uploadMedia('./assets/img/nespresso.jpeg', 'image', function(arg, fileInformation) {
                var msg = new builder.Message(session).attachments([
                    {
                        contentType: 'wechat/image',
                        content: {
                            mediaId: fileInformation.media_id
                        }
                    }
                ]);
                session.send(msg);
                session.send('Please meet our best team mate! Always there when energy is decreasing a bit!')
            });
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
                                // Define temp files names
                                var tempFileName = guid.raw(),
                                    amrFile = './tmp/' + tempFileName + '.amr',
                                    wavFile = './tmp/' + tempFileName + '.wav';

                                // Write the voice message in tmp folder
                                fs.writeFile(amrFile, data, function(err) {
                                    if(err) {
                                        return console.log("Error while writing file " + err);
                                    }
                                    else {
                                        // Convert the AMR file to WAV
                                        ffmpegConvert(input, output, function (error, stdout, stderr, output) {
                                            if(!error) {
                                                // Send WAV to Microsoft speech recognition
                                                let wav = fs.readFileSync(output);
                                                speechClient.recognize(wav)
                                                    .then(response => {
                                                        console.log('======    ' + response.results[0].name);
                                                    });
                                            }
                                            else {
                                                console.log("There was an error " + error);
                                            }
                                        });
                                    }
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