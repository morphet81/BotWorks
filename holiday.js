var builder     = require('botbuilder'),
    botUtils    = require('./bot-utils'),
    botUser     = require('./user'),
    fs          = require('fs');

// Main dialog with LUIS
var englishRecognizer = new builder.LuisRecognizer(process.env.LUIS_EN_MODEL_URL);
var chineseRecognizer = new builder.LuisRecognizer(process.env.LUIS_CN_MODEL_URL);

module.exports = (wechatConnector) => {
    var module = {};

    module.dialog = [
        function (session) {
            session.send('holiday_welcome');
            var options = session.localizer.gettext(session.preferredLocale(), "holiday_climate_choice");
            builder.Prompts.choice(session, 'holiday_climate', options);
        },
        function (session) {
            builder.Prompts.text(session, 'holiday_location');
        },
        function(session, result) {
            console.log(util.inspect(session.result));
            console.log(util.inspect(session.message));
        }
    ];

    return module;
};