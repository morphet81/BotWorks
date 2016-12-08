var exec = require('child_process').exec;

module.exports = {
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
    }
};