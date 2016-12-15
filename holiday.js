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
                        "picurl": "https://media.gadventures.com/media-server/cache/d8/66/d86652654b0220d20b9a6f86309371cf.jpg"
                    },
                    {
                        "title": "Bali",
                        "description": "Discover the pearl of Indonesia!",
                        "url": "https://en.wikipedia.org/wiki/Bali",
                        "picurl": "https://pix6.agoda.net/city/17193/17193-7x3.jpg"
                    },
                    {
                        "title": "Malaysia",
                        "description": "Authenticity and modernity in the heart of Asia!",
                        "url": "https://en.wikipedia.org/wiki/Malaysia",
                        "picurl": "http://www.rts.com.eg/wp-content/uploads/st_uploadfont/Malaysia.jpg"
                    },
                    {
                        "title": "Sanya",
                        "description": "China in the sun and on the beach!",
                        "url": "https://en.wikipedia.org/wiki/Hainan",
                        "picurl": "http://www.cnto.org/wp-content/uploads/2014/05/Sanya-Beach.jpg"
                    }
                ]
            };

            var msg = new builder.Message(session).attachments([attachments]);

            session.send(msg);
        }
    ];

    return module;
};