var builder = require('botbuilder')
botUser = require('./../data/user'),
    botUtils = require('./../tools/bot-utils'),
    util = require('util');

var localePromptDialog = [
    function (session) {
        // Prompt the user to select their preferred locale
        builder.Prompts.choice(session, "locale_prompt", 'English|中文');
    },
    function (session, results) {
        // Update preferred locale
        var locale = botUtils.getLocaleCode(results.response.entity);

        session.preferredLocale(locale, function (err) {
            if (!err) {
                // Save user's locale
                botUser.getUser(session, function (user) {
                    user.setLocale(locale);

                    session.send('locale_updated');
                    session.replaceDialog('/name_prompt');
                });
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
        botUser.getUser(session, function (user) {
            // Save user's locale
            user.setFirstName(results.response);
            session.endDialog('name_confirmation', user.first_name);
        });
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
            botUser.getUser(session, function(user) {
                if(user.locale == undefined) {
                    session.beginDialog('/locale_prompt');
                }
                else {
                    if(user.first_name == undefined) {
                        session.beginDialog('/name_prompt');
                    }
                    else {
                        session.message.introduction = true;
                        session.replaceDialog(nextDialog);
                    }
                }
            });
        },
        function (session) {
            session.message.introduction = true;
            session.replaceDialog(nextDialog);
        }
    ];

    return module;
};