// var express   = require('express');
// var wechat = require('wechat');
// var config = {
//     token: 'phoceisdev2token',
//     appid: 'wxc684e65175be456e',
//     encodingAESKey: 'gkLTYN1OZ5sYHeWnROB0FbyOuFtNhHErcJQozpN6ZrQ'
// };
//
// // Create http server
// var app    = express();
//
// app.use(express.query());
// app.use('/wechat', wechat(config, function (req, res, next) {
//     // 微信输入信息都在req.weixin上
//     var message = req.weixin;
//     if (message.FromUserName === 'diaosi') {
//         // 回复屌丝(普通回复)
//         res.reply('hehe');
//     } else if (message.FromUserName === 'text') {
//         //你也可以这样回复text类型的信息
//         res.reply({
//             content: 'text object',
//             type: 'text'
//         });
//     } else if (message.FromUserName === 'hehe') {
//         // 回复一段音乐
//         res.reply({
//             type: "music",
//             content: {
//                 title: "来段音乐吧",
//                 description: "一无所有",
//                 musicUrl: "http://mp3.com/xx.mp3",
//                 hqMusicUrl: "http://mp3.com/xx.mp3",
//                 thumbMediaId: "thisThumbMediaId"
//             }
//         });
//     } else {
//         // 回复高富帅(图文回复)
//         res.reply([
//             {
//                 title: '你来我家接我吧',
//                 description: '这是女神与高富帅之间的对话',
//                 picurl: 'http://nodeapi.cloudfoundry.com/qrcode.jpg',
//                 url: 'http://nodeapi.cloudfoundry.com/'
//             }
//         ]);
//     }
// }));
//
// app.get('*', function(req, res) {
//     res.send(200, 'Hello Wechat Bot');
// });
//
// // Start listen on port
// app.listen(process.env.port || 9090, function() {
//     console.log('server is running.');
// });



var express   = require('express'),
    builder   = require('botbuilder'),
    connector = require('botbuilder-wechat-connector');

// Create http server
var app    = express();

// Create wechat connector
var wechatConnector = new connector.WechatConnector({
    wechatAppId: 'wxc684e65175be456e',
    wechatSecret: 'fe7e6e25584e218ed86499171bf0a421',
    wechatToken: 'phoceisdev2token',
    wechatEncodingAESKey: 'gkLTYN1OZ5sYHeWnROB0FbyOuFtNhHErcJQozpN6ZrQ',

    appToken: 'phoceisdev2token',
    appID: 'wxc684e65175be456e',
    encodingAESKey: 'gkLTYN1OZ5sYHeWnROB0FbyOuFtNhHErcJQozpN6ZrQ'
});

var bot = new builder.UniversalBot(wechatConnector);

// Bot dialogs
bot.dialog('/', [
    function (session) {
        if (session.userData && session.userData.name) {
            if (session.message.attachments &&
                session.message.attachments.length > 0) {
                var atm = session.message.attachments[0];
                if (atm.contentType == connector.WechatAttachmentType.Image) {
                    var msg = new builder.Message(session).attachments([atm]);
                    session.send(msg);
                }
            }
            session.send("How are you, " + session.userData.name);
        } else {
            builder.Prompts.text(session, "What's your name?");
        }
    },
    function (session, results) {
        session.userData.name = results.response;
        session.send("OK, " + session.userData.name);
        builder.Prompts.text(session, "What's your age?");
    },
    function (session, results) {
        session.userData.age = results.response;
        session.send("All right, " + results.response);
    }
]);

app.use('/wechat', wechatConnector.listen());

app.get('*', function(req, res) {
    res.send(200, 'Hello Wechat Bot');
});

// Start listen on port
app.listen(process.env.port || 9090, function() {
    console.log('server is running.');
});