var exec    = require('child_process').exec,
    fs      = require('fs');

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
        // If user is using Wechat, need to upload the image first
        if(session.message.address.channelId == channels.wechat) {
            wechatConnector.wechatAPI.uploadMedia(imagePath, 'image', function (arg, fileInformation) {
                var msg = new builder.Message(session).attachments([
                    {
                        contentType: 'wechat/image',
                        content: {
                            mediaId: fileInformation.media_id
                        }
                    }
                ]);
                session.send(msg);
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

            session.send(msg);
        }
    }
};