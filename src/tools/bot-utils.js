var exec        = require('child_process').exec,
    bingSpeech  = require('morphet-bingspeech-api-client'),
    fs          = require('fs'),
    guid        = require('guid'),
    util        = require('util');

let speechClient = new bingSpeech.BingSpeechClient(process.env.BING_SPEECH_KEY);

// Channels ids
var channels = {
    wechat: 'wechat'
};

var isWechat = (session) => {
    return session.message.address.channelId == channels.wechat;
}

module.exports = {
    Channels: channels,

    // Convert a file with ffmpeg
    ffmpegConvert: function (input, output, callback) {
        var isWin = /^win/.test(process.platform);
        var cmd = 'ffmpeg -y -i ' + input + ' ' + output;

        if(isWin) {
            cmd = '.\\src\\assets\\ffmpeg\\ffmpeg -y -i ' + input + ' ' + output;
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
    sendImage: function(builder, session, wechatConnector, imagePath, message, ...messageArgs) {
        // If user is using Wechat, need to upload the image first
        if (isWechat(session)) {
            wechatConnector.wechatAPI.uploadMedia(imagePath, 'image', function (arg, fileInformation) {
                var msg = new builder.Message(session).attachments([
                    {
                        contentType: 'wechat/image',
                        content: {
                            mediaId: fileInformation.media_id
                        }
                    }
                ]);

                // Set message
                if(message) {
                    msg.text(session.createMessage(message, messageArgs).text);
                }

                session.send(msg);

                resolve();
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

            // Set message
            if(message) {
                msg.text(session.createMessage(message, messageArgs).text);
            }

            session.send(msg);
        }
    },

    autoAnswer: function(builder, session, wechatConnector, message, ...args) {
        var answer = session.createMessage(message, args);

        // session.startBatch();
        // session.send(answer);
        // session.sendBatch(function() {
        //     resolve();
        // });

        botUtils.sendVoice(builder, session, wechatConnector, answer.text);
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