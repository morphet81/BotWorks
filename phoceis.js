var builder = require('botbuilder');

// Main dialog with LUIS
var englishRecognizer = new builder.LuisRecognizer(process.env.LUIS_EN_MODEL_URL);
var chineseRecognizer = new builder.LuisRecognizer(process.env.LUIS_CN_MODEL_URL);

module.exports = {
    Label: 'Hotels',
    Dialog: new builder.IntentDialog({ recognizers: [englishRecognizer, chineseRecognizer] })
        .matches('GetPhoceisSize', (session, args) => {
            session.send("There are currently 7 Phoceis team members");
        })
        .matches('GetPhoceisLocation', (session, args) => {
            session.send("Phoceis Asia is located in Shanghai, 655 Changhua Road");
        })
        .matches(/^GetPhoceisLocationCN/i, (session) => {
            session.send("Phoceis Asia is located in Shanghai, 655 Changhua Road");
        })
        .matches('GetPhoceisLocationCN', (session, args) => {
            session.send("Yep, c'est loupé.....");
        })
        .matches('GetBeerDay', (session, args) => {
            session.send("Beer day is on Friday. Don't hesitate to ask Crystal for your favorite beer!");
        })
        .matches('GetBestTeamMate', (session, args) => {
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
                session.send('Please meet our best team mate! Always there when energy is decreasing a bit!')
            });
        })
        .matches('Help', builder.DialogAction.send('Hi! Try asking me things like \'search hotels in Seattle\', \'search hotels near LAX airport\' or \'show me the reviews of The Bot Resort\''))
        .onDefault((session) => {
            // session.send('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);

            session.send(session.preferredLocale());

            // builder.Prompts.choice(
            //     session,
            //     'Are you looking for a flight or a hotel?',
            //     ['YES', 'NO'],
            //     {
            //         maxRetries: 3,
            //         retryPrompt: 'Not a valid option'
            //     });
        })
};