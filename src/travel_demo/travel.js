var builder     = require('botbuilder'),
    botUtils    = require('../tools/bot-utils'),
    botUser     = require('../data/user'),
    fs          = require('fs');

// Main dialog with LUIS
var englishRecognizer = new builder.LuisRecognizer(process.env.LUIS_EN_MODEL_URL);
var chineseRecognizer = new builder.LuisRecognizer(process.env.LUIS_CN_MODEL_URL);

var timeout = 1000;

module.exports = (wechatConnector) => {
    var module = {};

    module.dialog = [
        function (session) {
            session.send('holiday_welcome');

            setTimeout(function() {
                var options = session.localizer.gettext(session.preferredLocale(), "holiday_climate_choice");
                builder.Prompts.choice(session, 'holiday_climate', options);
            }, timeout);
        },
        // function (session) {
        //     builder.Prompts.text(session, 'holiday_location');
        // },
        // function(session) {
        //     session.send('holiday_location_confirm');
        //
        //     setTimeout(function () {
        //         builder.Prompts.text(session, 'holiday_age');
        //     }, timeout);
        // },
        // function(session) {
        //     builder.Prompts.text(session, 'holiday_keywords');
        // },
        // function(session) {
        //     session.send('holiday_start_search');
        //
        //     setTimeout(function () {
        //         var attachments = {
        //             contentType: 'wechat/news',
        //             content: [
        //                 {
        //                     "title": "Phi Phi Islands",
        //                     "description": "Beach, sun and Thai food!",
        //                     "url": "https://en.wikipedia.org/wiki/Phi_Phi_Islands",
        //                     "picurl": "http://phoceisasiabot.azurewebsites.net/phiphi.jpg"
        //                 },
        //                 {
        //                     "title": "Bali",
        //                     "description": "Discover the pearl of Indonesia!",
        //                     "url": "https://en.wikipedia.org/wiki/Bali",
        //                     "picurl": "http://phoceisasiabot.azurewebsites.net/bali.jpg"
        //                 },
        //                 {
        //                     "title": "Malaysia",
        //                     "description": "Authenticity and modernity in the heart of Asia!",
        //                     "url": "https://en.wikipedia.org/wiki/Malaysia",
        //                     "picurl": "http://phoceisasiabot.azurewebsites.net/malaysia.jpg"
        //                 },
        //                 {
        //                     "title": "Sanya",
        //                     "description": "China in the sun and on the beach!",
        //                     "url": "https://en.wikipedia.org/wiki/Hainan",
        //                     "picurl": "http://phoceisasiabot.azurewebsites.net/hainan.jpg"
        //                 }
        //             ]
        //         };
        //
        //         var msg = new builder.Message(session)
        //             .attachments([attachments]);
        //
        //         session.send(msg);
        //     }, timeout * 2.5);
        //
        //     setTimeout(function () {
        //         builder.Prompts.text(session, 'holiday_select_destination');
        //     }, timeout * 3);
        // },
        // function(session) {
        //     builder.Prompts.text(session, 'holiday_destination_selected');
        // },
        // function(session) {
        //     builder.Prompts.text(session, 'holiday_select_return_date');
        // },
        // function(session) {
        //     builder.Prompts.text(session, 'holiday_go_flight_1');
        // },
        // function(session) {
        //     var options = session.localizer.gettext(session.preferredLocale(), "holiday_select_day_period");
        //     builder.Prompts.choice(session, 'holiday_search_new_flight', options);
        // },
        // function(session) {
        //     builder.Prompts.text(session, 'holiday_go_flight_2');
        // },
        // function(session) {
        //     builder.Prompts.text(session, 'holiday_return_flight');
        // },
        // function(session) {
        //     builder.Prompts.text(session, 'holiday_hotel_preferences');
        // },
        // function(session) {
        //     var attachments = {
        //         contentType: 'wechat/news',
        //         content: [
        //             {
        //                 "title": "Ramada Bintang Bali Resort",
        //                 "description": "Ramada Bintang Bali Resort",
        //                 "url": "https://www.wyndhamhotels.com/ramada/kuta-bali-indonesia/ramada-bintang-bali-resort/overview?Cid=SEAPR&gclid=Cj0KEQiAyuPCBRCimuayhb3qqvwBEiQAgz62kZWFNAFMH8zSCiflPfIjCA-FoGblCHOb7wzPCa0jbIMaAkey8P8HAQ",
        //                 "picurl": "http://phoceisasiabot.azurewebsites.net/hotel_bali.jpg"
        //             }
        //         ]
        //     };
        //
        //     var msg = new builder.Message(session).attachments([attachments]);
        //
        //     session.send(msg);
        //
        //     setTimeout(function () {
        //         builder.Prompts.text(session, 'holiday_hotel_suggestion');
        //     }, timeout);
        // },
        // function(session) {
        //     var options = session.localizer.gettext(session.preferredLocale(), "yes_no");
        //     builder.Prompts.choice(session, 'holiday_hotel_confirmation', options);
        // },
        function(session) {
            builder.Prompts.text(session, 'holiday_hotel_payment');

            setTimeout(function () {
                session.endDialog('holiday_hotel_payment_validation');
            }, timeout * 6);
        }
    ];

    return module;
};