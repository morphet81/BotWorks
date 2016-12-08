var builder = require('botbuilder');

// Main dialog with LUIS
var englishRecognizer = new builder.LuisRecognizer(process.env.LUIS_EN_MODEL_URL);
var chineseRecognizer = new builder.LuisRecognizer(process.env.LUIS_CN_MODEL_URL);

module.exports = (wechatConnector) => {
    var module = {};

    module.dialog = new builder.IntentDialog({ recognizers: [englishRecognizer, chineseRecognizer] })
        .matches('Introduction', (session) => {
            session.send('phoceis_dialog_intro');
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

            console.log(util.inspect(session.message));

            wechatConnector.wechatAPI.uploadMedia('./assets/img/nespresso.jpeg', 'image', function(arg, fileInformation) {
                var msg = new builder.Message(session).attachments([
                    {
                        contentType: 'wechat/image',
                        content: {
                            mediaId: fileInformation.media_id
                        }
                    }
                ]);
                session.send(msg);
                session.send('phoceis_best_teammate')
            });
        })
        .matches('Help', builder.DialogAction.send('phoceis_help'))
        .onDefault((session) => {
            if(session.message.introduction) {
                session.send('phoceis_dialog_intro');
            }
            else {
                session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
            }
        })

    return module;
};