var exec = require('child_process').exec;

module.exports = () => {
    var module = {};

    // Convert a file with ffmpeg
    module.ffmpegConvert = function (input, output, callback) {
        var isWin = /^win/.test(process.platform);
        var cmd = 'ffmpeg -y -i ' + input + ' ' + output;

        if(isWin) {
            cmd = '.\\assets\\ffmpeg\\ffmpeg -y -i ' + input + ' ' + output;
        }

        console.log('Will execute command "%s"', cmd);
        exec(cmd, function(error, stdout, stderr) {
            callback(error, stdout, stderr, output);
        });
    };

    return module;
};