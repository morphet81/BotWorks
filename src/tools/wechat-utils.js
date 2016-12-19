var util            = require('util'),
    request         = require('request'),
    NodeCache       = require( "node-cache"),
    randomstring    = require("randomstring"),
    sha1            = require('sha1'),
    wxPayment       = require('wx-payment'),
    fs              = require('fs');

// Instantiate cache manager
var appCache = new NodeCache();

// Init WeChat payment library
wxPayment.init({
    appid: process.env.WECHAT_APP_ID,
    mch_id: process.env.WECHAT_MERCHANT_ID,
    apiKey: process.env.WECHAT_API_KEY,
    pfx: fs.readFileSync(process.env.WECHAT_CERT_FILE_PATH)
});

// Constants
const kWechatAccessToken = 'wechat_access_token';
const kJsapiTicket = 'wechat_jsapi_ticket';

// Recover WeChat access token
var _getAccessToken =  function() {
    return new Promise(
        function (resolve, reject) {
            var accessToken = appCache.get(kWechatAccessToken);

            if(accessToken == undefined) {
                request.get(`https://api.wechat.com/cgi-bin/token?grant_type=client_credential&appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}`)
                    .on('data', function (chunk) {
                        // Parse the response
                        var response = JSON.parse(chunk);

                        // Cache the access token
                        appCache.set(kWechatAccessToken, response.access_token, (response.expires_in - 180));

                        // Send access token
                        resolve(response.access_token);
                    })
                    .on('error', function (err) {
                        reject(err);
                    });
            }
            else {
                resolve(accessToken);
            }
        }
    )
};

// Recover jsapi ticket
var _getJsapiTicket = function() {
    return new Promise(
        function(resolve, reject) {
            var jsapiTicket = appCache.get(kJsapiTicket);

            if(jsapiTicket == undefined) {
                _getAccessToken().then(function (accessToken) {
                    request.get(`https://api.wechat.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`)
                        .on('data', function (chunk) {
                            // Parse the response
                            var response = JSON.parse(chunk);

                            // Cache the access token
                            appCache.set(kJsapiTicket, response.ticket, (response.expires_in - 180));

                            // Send access token
                            resolve(response.ticket);
                        })
                        .on('error', function (err) {
                            reject(err);
                        });
                });
            }
            else {
                resolve(jsapiTicket);
            }
        }
    )
};

// Get config object for WeChat JS API
var _getJsapiConfig = function(req, debug = false) {
    return new Promise(
        function(resolve, reject) {
            _getJsapiTicket()
                .then(function(jsapiTicket) {
                    // Init signature calculation variables
                    var timeStamp = Date.now();
                    var nonceStr = randomstring.generate();

                    // Generate signature
                    var signatureRoot = `jsapi_ticket=${jsapiTicket}&noncestr=${nonceStr}&timestamp=${timeStamp}&url=http://${req.headers.host}${req.url}`;
                    var signature = sha1(signatureRoot);

                    // Wechat JS API config
                    var response = {
                        debug: debug,
                        appId: process.env.WECHAT_APP_ID,
                        timestamp: timeStamp,
                        nonceStr: nonceStr,
                        signature: signature,
                        jsApiList: ['chooseWXPay']
                    };

                    resolve(response);
                })
                .catch(function (error) {
                    reject(error);
                });
        }
    )
};

// Recover WeChat access token
var _getUserAccessToken =  function(authCode) {
    return new Promise(
        function (resolve, reject) {
            request.get(`https://api.weixin.qq.com/sns/oauth2/access_token?grant_type=authorization_code&appid=${process.env.WECHAT_APP_ID}&secret=${process.env.WECHAT_APP_SECRET}&code=${authCode}`)
                .on('data', function (chunk) {
                    resolve(JSON.parse(chunk));
                })
                .on('error', function (err) {
                    reject(err);
                });
        }
    )
};

var _createUnifiedOrder = function(req, body, outTradeNo, totalFee, notifyUrl, productId, openId) {
    return new Promise(
        function (resolve, reject) {
            var params = {
                body: body,
                out_trade_no: outTradeNo,
                total_fee: totalFee,
                spbill_create_ip: (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(':')[0],
                notify_uri: notifyUrl.split('?')[0],
                trade_type: 'JSAPI',
                product_id: productId,
                openid: openId
            };

            console.log(util.inspect(params));

            wxPayment.getBrandWCPayRequestParams(params, function (err, result) {
                if(err == undefined) {
                    resolve(result);
                }
                else {
                    reject(err);
                }
            });
        }
    )
};

module.exports = {
    getAccessToken: _getAccessToken,
    getJsapiTicket: _getJsapiTicket,
    getJsapiConfig: _getJsapiConfig,
    getUserAccessToken: _getUserAccessToken,
    createUnifiedOrder: _createUnifiedOrder
};