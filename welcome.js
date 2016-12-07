var builder = require('botbuilder');

// Main dialog with LUIS
var englishRecognizer = new builder.LuisRecognizer(process.env.LUIS_EN_MODEL_URL);
var chineseRecognizer = new builder.LuisRecognizer(process.env.LUIS_CN_MODEL_URL);

module.exports = {
    Dialog: [
        function (session) {
            // Prompt the user to select their preferred locale
            builder.Prompts.choice(session, "locale_prompt", 'English|中文');
        },
        function (session, results) {
            // Update preferred locale
            var locale;
            switch (results.response.entity) {
                case 'English':
                    locale = 'en';
                    break;
                case '中文':
                    locale = 'zh';
                    break;
            }
            session.preferredLocale(locale, function (err) {
                if (!err) {
                    // Locale files loaded
                    session.endDialog('locale_updated');
                } else {
                    // Problem loading the selected locale
                    session.error(err);
                }
            });
        }
    ]
};