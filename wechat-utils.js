var util            = require('util'),
    request         = require('request'),
    NodeCache       = require( "node-cache"),
    randomstring    = require("randomstring"),
    sha1            = require('sha1');

// Instantiate cache manager
var appCache = new NodeCache();

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
}

module.exports = {
    // Recover WeChat access token
    getAccessToken:  _getAccessToken,

    // Recover jsapi ticket
    getJsapiTicket: _getJsapiTicket,

    // Get config object for WeChat JS API
    getJsapiConfig: function(req) {
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
                            debug: true,
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
    }
};