var builder     = require('botbuilder'),
    botUtils    = require('./bot-utils'),
    botUser     = require('./user'),
    fs          = require('fs');

// Main dialog with LUIS
var englishRecognizer = new builder.LuisRecognizer(process.env.LUIS_EN_MODEL_URL);
var chineseRecognizer = new builder.LuisRecognizer(process.env.LUIS_CN_MODEL_URL);

module.exports = (wechatConnector) => {
    var module = {};

    module.dialog = new builder.IntentDialog({ recognizers: [englishRecognizer, chineseRecognizer] })
        .matches('Greetings', (session) => {
            botUser.getUser(session, function (user) {
                session.send('hi', user.first_name);
                botUtils.autoAnswer(builder, session, wechatConnector, 'phoceis_dialog_intro');
            });
        })
        .matches('GetPhoceisSize', (session) => {
            botUtils.autoAnswer(builder, session, wechatConnector, 'phoceis_members_count');
        })
        .matches('GetPhoceisLocation', (session) => {
            botUtils.autoAnswer(builder, session, wechatConnector, 'phoceis_location');
        })
        .matches('GetBeerDay', (session) => {
            botUtils.autoAnswer(builder, session, wechatConnector, 'phoceis_beer_day');
        })
        .matches('GetBestTeamMate', (session) => {
            botUtils.sendImage(builder, session, wechatConnector, './assets/img/nespresso.jpeg');
            botUtils.autoAnswer(builder, session, wechatConnector, 'phoceis_best_teammate');
        })
        .matches('ChangeLocale', (session, args) => {
            var newLocale;
            for(var i=0 ; i<args.entities.length ; i++) {
                if(args.entities[i].type == 'Locale') {
                    newLocale = args.entities[i].entity;
                }
            }

            if(newLocale == undefined) {
                botUtils.autoAnswer(builder, session, wechatConnector, 'change_locale_no_locale');
            }
            else {
                var localeCode = botUtils.getLocaleCode(newLocale);

                if(localeCode == undefined) {
                    botUtils.autoAnswer(builder, session, wechatConnector, 'change_locale_not_found');
                }
                else {
                    session.preferredLocale(localeCode, function (err) {
                        if (!err) {
                            botUser.getUser(session, function (user) {
                                var oldLocale = user.locale;
                                user.setLocale(localeCode);
                                botUtils.autoAnswer(builder, session, wechatConnector, 'change_locale_ok', oldLocale);
                            });
                        } else {
                            session.error(err);
                        }
                    });
                }
            }
        })
        .matches('Help', builder.DialogAction.send('phoceis_help'))
        .onDefault((session) => {
            if(session.message.introduction) {
                botUtils.autoAnswer(builder, session, wechatConnector, 'phoceis_dialog_intro');
            }
            else {
                var answer = session.localizer.gettext(session.preferredLocale(), 'default', session.message.text);
                botUtils.autoAnswer(builder, session, wechatConnector, answer);
            }
        });

    return module;
};