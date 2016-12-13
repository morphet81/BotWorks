var builder     = require('botbuilder'),
    botUtils    = require('./bot-utils'),
    botUser     = require('./user'),
    fs          = require('fs');











// function convert(s) {
//     return s.split('').map(function(c) {
//         return '\\u' + ('0000' + c.charCodeAt(0).toString(16).toUpperCase()).slice(-4);
//     }).join('');
// }
//
//
// var request = require('request');
// var util = require('util');
// var guid = require('guid');
// var utf8 = require('utf8');
// var gbk = require('gbk');
// var urlencode = require('urlencode');
// var bingSpeech  = require('./bingspeech-api-client');
// let speechClient = new bingSpeech.BingSpeechClient(process.env.BING_SPEECH_KEY);
//
// request({
//     uri: 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
//     method: 'POST',
//     headers: {
//         'Ocp-Apim-Subscription-Key': process.env.BING_SPEECH_KEY
//     }
// }, function (err, res, token) {
//     request({
//         uri: 'https://speech.platform.bing.com/synthesize',
//         method: 'POST',
//         headers: {
//             // 'Authorization': 'Bearer ' + new Buffer(token).toString('base64'),
//             'Authorization': 'Bearer ' + token,
//             'Content-Type': 'application/ssml+xml; charset=utf-8',
//             'X-Microsoft-OutputFormat': 'raw-8khz-8bit-mono-mulaw',
//             'X-Search-AppId': guid.raw(),
//             'X-Search-ClientID': guid.raw(),
//             'User-Agent': 'PhoceisBot'
//         },
//         body: `<speak version='1.0' xml:lang='en-US'><voice xml:lang='en-US' xml:gender='Female' name='Microsoft Server Speech Text to Speech Voice (en-US, ZiraRUS)'>Microsoft Bing Voice Output API</voice></speak>`
//     }, function(err, res, body) {
//         console.log(util.inspect(res));
//     });
// });
//
// // var message = urlencode('好的！ 让我们开始说');
// var message = '好的！ 让我们开始说';
// // var message = '124345';
//
// message = message;
//
// console.log(message);
//
// // speechClient.synthesize(message, 'zh-cn')
// //     .then(response => {
// //         fs.writeFile('./tmp/sound.wav', response.wave, function(err) {
// //             console.log("Cool");
// //         });
// //     })
// //     .catch(error => {
// //         console.log(error);
// //     });













// Main dialog with LUIS
var englishRecognizer = new builder.LuisRecognizer(process.env.LUIS_EN_MODEL_URL);
var chineseRecognizer = new builder.LuisRecognizer(process.env.LUIS_CN_MODEL_URL);

module.exports = (wechatConnector) => {
    var module = {};

    module.dialog = new builder.IntentDialog({ recognizers: [englishRecognizer, chineseRecognizer] })
        .matches('Greetings', (session) => {
            botUser.getUser(session, function (user) {
                botUtils.autoAnswer(builder, session, wechatConnector, 'hi', user.first_name);
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
            botUtils.sendImage(builder, session, wechatConnector, './assets/img/nespresso.jpeg')
                .then(() => {
                    console.log('THEN HAS BEEN CALLED');
                    botUtils.autoAnswer(builder, session, wechatConnector, 'phoceis_best_teammate');
                });
            // botUtils.autoAnswer(builder, session, wechatConnector, 'phoceis_best_teammate');
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
                                botUtils.autoAnswer(builder, session, wechatConnector, 'change_locale_ok', newLocale);
                                user.setLocale(localeCode);
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
                botUtils.autoAnswer(builder, session, wechatConnector, 'default', session.message.text);
            }
        });

    return module;
};