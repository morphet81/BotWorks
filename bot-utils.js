var exec        = require('child_process').exec,
    bingSpeech  = require('bingspeech-api-client'),
    // bingSpeech  = require('./bingspeech-api-client'),
    fs          = require('fs'),
    guid        = require('guid');

let speechClient = new bingSpeech.BingSpeechClient(process.env.BING_SPEECH_KEY);

// Channels ids
var channels = {
    wechat: 'wechat'
}

module.exports = {
    Channels: channels,

    // Convert a file with ffmpeg
    ffmpegConvert: function (input, output, callback) {
        var isWin = /^win/.test(process.platform);
        var cmd = 'ffmpeg -y -i ' + input + ' ' + output;

        if(isWin) {
            cmd = '.\\assets\\ffmpeg\\ffmpeg -y -i ' + input + ' ' + output;
        }

        console.log('Will execute command "%s"', cmd);
        exec(cmd, function(error, stdout, stderr) {
            callback(error, stdout, stderr, output);
        });
    },

    // Get user information from session
    getSessionUserId: function(session) {
        return session.message.address.user.id;
    },

    // Get user information from session
    getSessionUserName: function(session) {
        return session.message.address.user.name;
    },

    // Send an image
    sendImage: function(builder, session, wechatConnector, imagePath) {
        return new Promise(function (resolve, reject) {
            // If user is using Wechat, need to upload the image first
            if (session.message.address.channelId == channels.wechat) {
                wechatConnector.wechatAPI.uploadMedia(imagePath, 'image', function (arg, fileInformation) {
                    var msg = new builder.Message(session).attachments([
                        {
                            contentType: 'wechat/image',
                            content: {
                                mediaId: fileInformation.media_id
                            }
                        }
                    ]);
                    session.startBatch();
                    session.send(msg);
                    session.sendBatch(function() {
                        console.log('a;sdkfljas;dlfkja;sldfjlkadsf');
                        resolve();
                    });
                });
            }
            else {
                let picture = fs.readFileSync(imagePath);

                var attachment = {
                    contentUrl: 'data:image/png;base64, ' + picture.toString('base64'),
                    contentType: 'image/png',
                    name: 'BotFrameworkOverview.png'
                };

                var msg = new builder.Message(session)
                    .addAttachment(attachment);

                session.startBatch();
                session.send(msg);
                session.sendBatch(function() {
                    console.log('a;sdkfljas;dlfkja;sldfjlkadsf');
                    resolve();
                });
            }
        })
    },

    autoAnswer: function(builder, session, wechatConnector, message, ...args) {
        var answer = session.createMessage(message, args);

        session.send(answer);

        // botUtils.sendVoice(builder, session, wechatConnector, answer.text);
        //
        // console.log(session.preferredLocale());
        // console.log(answer.text);

        // if(session.message.audio) {
        //
        // }
        // else {
        //     session.send(answer);
        // }
    },

    // Send audio response
    sendVoice: function(builder, session, wechatConnector, message, locale) {
        speechClient.synthesize(message, locale == undefined ? session.preferredLocale() : locale)
            .then(response => {
                // Define file names
                var voiceName = guid.raw();
                var input = './tmp/' + voiceName + '.wav';
                var output = './tmp/' + voiceName + '.amr';

                // Write input
                fs.writeFile(input, response.wave, function(err) {
                    // If Wechat, need to convert
                    if(session.message.address.channelId == channels.wechat) {
                        botUtils.ffmpegConvert(input, output, function () {
                            console.log('file writen');
                            wechatConnector.wechatAPI.uploadMedia(output, 'voice', function (arg, fileInformation) {
                                var msg = new builder.Message(session).attachments([
                                    {
                                        contentType: 'wechat/voice',
                                        content: {
                                            mediaId: fileInformation.media_id
                                        }
                                    }
                                ]);

                                fs.unlink(input);
                                fs.unlink(output);

                                session.send(msg);
                            });
                        });
                    }
                    else {
                        // let voice = fs.readFileSync(input);
                        //
                        // var attachment = {
                        //     contentUrl: 'data:image/png;base64, ' + picture.toString('base64'),
                        //     contentType: 'image/png',
                        //     name: 'BotFrameworkOverview.png'
                        // };
                        //
                        // var msg = new builder.Message(session)
                        //     .addAttachment(attachment);
                        //
                        // session.send(msg);
                    }
                });
            });
    },

    // Get a locale code
    getLocaleCode: (locale) => {
        switch (locale.toLowerCase()) {
            case 'english':
            case 'american':
            case '英文':
            case '英语':
                return 'en-us';
            case '中文':
            case '汉语':
            case 'chinese':
            case 'mandarin':
                return 'zh-cn';
        }
    }
};