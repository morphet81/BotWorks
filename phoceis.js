var builder     = require('botbuilder'),
    botUtils    = require('./bot-utils'),
    botUser     = require('./user');

// Main dialog with LUIS
var englishRecognizer = new builder.LuisRecognizer(process.env.LUIS_EN_MODEL_URL);
var chineseRecognizer = new builder.LuisRecognizer(process.env.LUIS_CN_MODEL_URL);

module.exports = (wechatConnector) => {
    var module = {};

    module.dialog = new builder.IntentDialog({ recognizers: [englishRecognizer, chineseRecognizer] })
        .matches('Greetings', (session) => {
            botUser.getUser(session, function (user) {
                session.send('hi', user.first_name);
                session.send('phoceis_dialog_intro');
            });
        })
        .matches('GetPhoceisSize', (session) => {
            session.send('phoceis_members_count');
        })
        .matches('GetPhoceisLocation', (session) => {
            session.send('phoceis_location');
        })
        .matches('GetBeerDay', (session) => {
            session.send('phoceis_beer_day');
        })
        .matches('GetBestTeamMate', (session) => {
            botUtils.sendImage(builder, session, wechatConnector, './assets/img/nespresso.jpeg');
            session.send('phoceis_best_teammate');
        })
        .matches('ChangeLocale', (session, args) => {
            var newLocale;
            for(var i=0 ; i<args.entities.length ; i++) {
                if(args.entities[i].type == 'Locale') {
                    newLocale = args.entities[i].entity;
                }
            }

            if(newLocale == undefined) {
                session.send('change_locale_no_locale');
            }
            else {
                var localeCode = botUtils.getLocaleCode(newLocale);

                if(localeCode == undefined) {
                    session.send('change_locale_not_found', newLocale);
                }
                else {
                    session.preferredLocale(localeCode, function (err) {
                        if (!err) {
                            botUser.getUser(session, function (user) {
                                user.setLocale(localeCode);
                                session.send('change_locale_ok', newLocale);
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

            return [
                new builder.HeroCard(session)
                    .title('Azure Storage')
                    .subtitle('Massively scalable cloud storage for your applications')
                    .text('Store and help protect your data. Get durable, highly available data storage across the globe and pay only for what you use.')
                    .images([
                        builder.CardImage.create(session, 'https://acom.azurecomcdn.net/80C57D/cdn/mediahandler/docarticles/dpsmedia-prod/azure.microsoft.com/en-us/documentation/articles/storage-introduction/20160801042915/storage-concepts.png')
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/storage/', 'Learn More')
                    ]),

                new builder.ThumbnailCard(session)
                    .title('DocumentDB')
                    .subtitle('Blazing fast, planet-scale NoSQL')
                    .text('NoSQL service for highly available, globally distributed apps—take full advantage of SQL and JavaScript over document and key-value data without the hassles of on-premises or virtual machine-based cloud database options.')
                    .images([
                        builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/29f4/beb4b953-ab91-4a31-b16a-71fb6d6829f4/WhatisAzureDocumentDB_960.jpg')
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, 'https://azure.microsoft.com/en-us/services/documentdb/', 'Learn More')
                    ])
            ];


            // if(session.message.introduction) {
            //     session.send('phoceis_dialog_intro');
            // }
            // else {
            //     session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
            // }
        });

    return module;
};