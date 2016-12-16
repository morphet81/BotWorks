require('dotenv-extended').load();

// require('request').debug = true

var express         = require('express'),
    builder         = require('botbuilder'),
    connector       = require('morphet-botbuilder-wechat-connector'),
    util            = require('util'),
    fs              = require('fs'),
    request         = require('request'),
    wechatUtils     = require('./tools/wechat-utils'),
    cheerio         = require('cheerio'),
    randomstring    = require('randomstring');

module.exports = {
    init: function () {

        // Create http server
        var app = express();

        // Wechat public files for wechat server
        app.use(express.static('./assets/wechat_public'));

        // Make images public
        app.use(express.static('./assets/img/demo'));

        // Demo Payment page
        // app.use(express.static('./demo'));
        app.use(express.static('./node_modules'));

        // Get WeChat access token
        app.get('/wechat_token', function (req, res) {
            wechatUtils.getAccessToken()
                .then(function (accessToken) {
                    res.status(200).send(accessToken);
                })
                .catch(function (error) {
                    res.status(500).send(error);
                });
        });

        // Output the payment page
        app.get('/payment', function (req, res) {
            // Read the content of the page
            var html = fs.readFileSync(__dirname + '/travel_demo/payment.html', 'utf8');
            var $ = cheerio.load(html);

            // Get auth code
            var authCode = req.query.code;

            // Additional script for the payment page, depending on the step in payment process
            var scriptNode;

            // If the auth code is not given, redirect the user to the wechat auth page
            if(authCode == undefined) {
                scriptNode = `<script>window.location = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=${process.env.WECHAT_APP_ID}&redirect_uri=http://${req.headers.host}${req.url}&response_type=code&scope=snsapi_base#wechat_redirect"</script>`;
                // console.log(`=======   ${scriptNode}`);
            }
            else {
                // Recover user's open id (through user access token)
                wechatUtils.getUserAccessToken(authCode)
                    .then(function (response) {
                        console.log('Response ', util.inspect(response));
                        // Create the order on Wechat side
                        wechatUtils.createUnifiedOrder(req, 'Trip to Bali', randomstring.generate(), 1, `http://${req.headers.host}${req.url}`, `bali_trip_demo`, response.open_id)
                            .then(function(prepaidConfig) {
                                console.log('prepaidConfig ', util.inspect(prepaidConfig));
                                // Get config params for using wechat JS API
                                wechatUtils.getJsapiConfig(req)
                                    .then(function (wechatConfig) {
                                        console.log('wechatConfig ', util.inspect(wechatConfig));
                                        scriptNode = `
                                            <script>
                                                var wechatConfig = ${JSON.stringify(wechatConfig)};
                                                var prepaidConfig = ${prepaidConfig};
                                            </script>`

                                    })
                                    .catch(function (error) {
                                        res.status(500).send(`There was an error while getting JS API config: ${error}`);
                                    })
                            })
                            .catch(function (error) {
                                console.log(`Error while create an order: ${error}`);
                            });
                    })
                    .catch(function (error) {
                        console.log(`There was an error while recovering user's access token: ${error}`)
                    });
            }
            $('body').append(scriptNode);

            // Send resulting page
            res.status(200).send($.html());
        });

        // Get the jsapi ticket
        app.get('/wechat_api_config', function (req, res) {
            wechatUtils.getJsapiConfig(req)
                .then(function (wechatConfig) {
                    res.status(200).send(wechatConfig);
                })
                .catch(function (error) {
                    res.status(500).send(`There was an error while trying to get the jsapi ticket: ${error}`);
                })
        });

        // Create wechat connector
        var wechatConnector = new connector.WechatConnector({
            appID: process.env.WECHAT_APP_ID,
            appSecret: process.env.WECHAT_APP_SECRET,
            appToken: process.env.WECHAT_TOKEN,
            encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY
        });

        // Internal modules
        var holiday = require('./travel_demo/travel')(wechatConnector);
        var phoceis = require('./dialogs/phoceis')(wechatConnector);
        var welcome = require('./dialogs/welcome')('/phoceis');
        var preprocessor = require('./tools/preprocessor')(wechatConnector);

        var defaultDialog = holiday.dialog;

        /**********-**************/
        /******  WECHAT BOT  *****/
        /**********-**************/

            // Build the WeChat bot
        var bot = new builder.UniversalBot(
            wechatConnector,
            {
                localizerSettings: {
                    botLocalePath: "./assets/locale",
                    defaultLocale: "en"
                }
            }
            );

        // Pre-treatment of the message
        bot.use({
            botbuilder: preprocessor.Core
        });

        // Bot dialogs
        bot.dialog('/', defaultDialog);
        bot.dialog('/holiday', holiday.dialog);
        bot.dialog('/phoceis', phoceis.dialog);
        welcome.initDialogs(bot);

        app.use('/wechat', wechatConnector.listen());

        /************-****************/
        /******  MICROSOFT BOT   *****/
        /************-****************/

        var microsoftConnector = new builder.ChatConnector({
            appId: process.env.MICROSOFT_APP_ID,
            appPassword: process.env.MICROSOFT_APP_PASSWORD
        });

        var microsoftBot = new builder.UniversalBot(
            microsoftConnector,
            {
                localizerSettings: {
                    botLocalePath: "./assets/locale",
                    defaultLocale: "en"
                }
            }
        );

        // Bot dialogs
        microsoftBot.dialog('/', defaultDialog);
        microsoftBot.dialog('/holiday', holiday.dialog);
        microsoftBot.dialog('/phoceis', phoceis.dialog);
        welcome.initDialogs(microsoftBot);

        // Pre-treatment of the message
        microsoftBot.use({
            botbuilder: preprocessor.Core
        });

        app.use('/microsoft', microsoftConnector.listen());

        /***************-*******************/
        /******     START LISTENING   ******/
        /***************-*******************/

        app.get('*', function (req, res) {
            res.status(200).send('Hello Wechat Bot');
        });

        // Start listen on port
        app.listen(process.env.port || 3978, function () {
            console.log('server is running');
        });
    }
};