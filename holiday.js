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
        // function (session) {
        //     session.send('holiday_welcome');
        //     var options = session.localizer.gettext(session.preferredLocale(), "holiday_climate_choice");
        //     builder.Prompts.choice(session, 'holiday_climate', options);
        // },
        // function (session) {
        //     builder.Prompts.text(session, 'holiday_location');
        // },
        // function(session) {
        //     session.send('holiday_location_confirm');
        //     builder.Prompts.text(session, 'holiday_age');
        // },
        // function(session) {
        //     builder.Prompts.text(session, 'holiday_keywords');
        // },
        function(session) {
            // builder.Prompts.text(session, 'holiday_start_search');
            var attachments = {
                contentType: 'wechat/news',
                content: [
                    {
                        "title": "Phi Phi Islands",
                        "description": "Beach, sun and Thai food!",
                        "url": "https://en.wikipedia.org/wiki/Phi_Phi_Islands",
                        "picurl": ["http://phoceisasiabot.azurewebsites.net/phiphi.jpg","http://phoceisasiabot.azurewebsites.net/malaysia.jpg"]
                    },
                    {
                        "title": "Bali",
                        "description": "Discover the pearl of Indonesia!",
                        "url": "https://en.wikipedia.org/wiki/Bali",
                        "picurl": "http://phoceisasiabot.azurewebsites.net/bali.jpg"
                    },
                    {
                        "title": "Malaysia",
                        "description": "Authenticity and modernity in the heart of Asia!",
                        "url": "https://en.wikipedia.org/wiki/Malaysia",
                        "picurl": "http://phoceisasiabot.azurewebsites.net/malaysia.jpg"
                    },
                    {
                        "title": "Sanya",
                        "description": "China in the sun and on the beach!",
                        "url": "https://en.wikipedia.org/wiki/Hainan",
                        "picurl": "http://phoceisasiabot.azurewebsites.net/hainan.jpg"
                    }
                ]
            };

            var msg = new builder.Message(session).attachments([attachments]);

            session.send(msg);
        }
    ];

    return module;
};