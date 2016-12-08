var builder = require('botbuilder')
    botUser = require('./user'),
    util = require('util');

var localePromptDialog = [
    function (session) {
        // Prompt the user to select their preferred locale
        builder.Prompts.choice(session, "locale_prompt", 'English|中文');
    },
    function (session, results) {
        var user = botUser.getUser(session);

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

        // Save user's locale
        user.locale = locale;
        user.save();

        session.preferredLocale(locale, function (err) {
            if (!err) {
                session.send('locale_updated');
                session.replaceDialog('/name_prompt');
            } else {
                session.error(err);
            }
        });
    }
];

var namePromptDialog = [
    function (session) {
        // Prompt the user to select their preferred locale
        builder.Prompts.text(session, "name_prompt");
    },
    function (session, results) {
        var user = botUser.getUser(session);

        // Save user's locale
        user.name = results.response;
        user.save();

        session.endDialog('name_confirmation', user.name);
    }
];

module.exports = (nextDialog) => {
    var module = {};

    module.initDialogs = (bot) => {
        bot.dialog('/locale_prompt', localePromptDialog);
        bot.dialog('/name_prompt', namePromptDialog);
    };

    module.dialog = [
        function (session) {
            var user = botUser.getUser(session);

            if(user.locale == undefined) {
                session.beginDialog('/locale_prompt');
            }
            else {
                session.beginDialog('/name_prompt');
            }
        },
        function (session) {
            session.message.text = 'Introduction';
            session.message.introduction = true;
            session.replaceDialog(nextDialog);
        }
    ];

    return module;
};