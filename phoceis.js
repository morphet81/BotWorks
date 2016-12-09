var builder     = require('botbuilder'),
    botUtils    = require('./bot-utils'),
    bingSpeech  = require('bingspeech-api-client'),
    botUser     = require('./user'),
    fs          = require('fs');

let speechClient = new bingSpeech.BingSpeechClient(process.env.BING_SPEECH_KEY);

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


            var response = session.localizer.gettext(session.preferredLocale(), "phoceis_beer_day");

            speechClient.synthesize(response, session.preferredLocale())
                .then(response => {
                    console.log('received syntethized voice');

                    fs.writeFile('./tmp/speaking.wav', response.wave, function(err) {
                        botUtils.ffmpegConvert('./tmp/speaking.wav', './tmp/speaking.amr', function () {
                            console.log('file writen');
                            wechatConnector.wechatAPI.uploadMedia('./tmp/speaking.amr', 'voice', function (arg, fileInformation) {
                                console.log(fileInformation);

                                var msg = new builder.Message(session).attachments([
                                    {
                                        contentType: 'wechat/voice',
                                        content: {
                                            mediaId: fileInformation.media_id
                                        }
                                    }
                                ]);
                                session.send(msg);
                            });
                        });
                    });
                });
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
            if(session.message.introduction) {
                session.send('phoceis_dialog_intro');
            }
            else {
                session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
            }
        });

    return module;
};