var spellService    = require('./spell-service'),
    util            = require('util'),
    fs              = require('fs'),
    guid            = require('guid'),
    bingSpeech      = require('bingspeech-api-client');

let speechClient = new bingSpeech.BingSpeechClient(process.env.BING_SPEECH_KEY);

module.exports = function(wechatConnector) {
    var module = {};

    module.Label = 'Pre-processor';

    module.Core = function (session, next) {
        var message = session.message;

        console.log('=====    ' + util.inspect(session.message.address.user));

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
                                ffmpegConvert(amrFile, wavFile, function (error, stdout, stderr, output) {
                                    if(!error) {
                                        // Send WAV to Microsoft speech recognition
                                        let wav = fs.readFileSync(output);
                                        speechClient.recognize(wav)
                                            .then(response => {
                                                if(response.results) {
                                                    console.log('======    ' + response.results[0].name);
                                                    session.message.text = response.results[0].name;
                                                    next();
                                                }
                                                else {
                                                    session.send('Sorry, we did\'t understand what you said. Please check your microphone or speak louder.');
                                                }
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
    };

    return module;
};