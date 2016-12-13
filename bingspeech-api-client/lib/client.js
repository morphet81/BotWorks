"use strict";
const uuid = require('node-uuid');
const request = require('request-promise-native');
const debug = require('debug')('bingspeechclient');
class BingSpeechClient {
    constructor(subscriptionKey) {
        this.BING_SPEECH_TOKEN_ENDPOINT = 'https://api.cognitive.microsoft.com/sts/v1.0/issueToken';
        this.BING_SPEECH_ENDPOINT_STT = 'https://speech.platform.bing.com/recognize';
        this.BING_SPEECH_ENDPOINT_TTS = 'https://speech.platform.bing.com/synthesize';
        this.AUDIO_OUTPUT_FORMAT = 'riff-8khz-8bit-mono-mulaw';
        this.subscriptionKey = subscriptionKey;
    }
    recognize(wave, locale = 'en-us') {
        return this.issueToken()
            .then((token) => {
            this.token = token;
            this.tokenExpirationDate = Date.now() + 9 * 60 * 1000;
            let baseRequest = request.defaults({
                qs: {
                    'scenarios': 'ulm',
                    'appid': 'D4D52672-91D7-4C74-8AD8-42B1D98141A5',
                    'locale': locale,
                    'device.os': '-',
                    'version': '3.0',
                    'format': 'json',
                    'requestid': uuid.v4(),
                    'instanceid': uuid.v4()
                },
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'audio/wav; codec="audio/pcm"; samplerate=16000',
                    'Content-Length': wave.byteLength
                },
                timeout: 15000,
                body: wave
            });
            return baseRequest.post(this.BING_SPEECH_ENDPOINT_STT);
        })
            .then(result => JSON.parse(result))
            .catch((err) => {
            throw new Error(`Voice recognition failed miserably: ${err.message}`);
        });
    }
    synthesize(text, locale = 'zh-cn') {
        return this.issueToken()
            .then((token) => {
            this.token = token;
            this.tokenExpirationDate = Date.now() + 9 * 60 * 1000;
            let name = 'Microsoft Server Speech Text to Speech Voice (zh-CN, HuihuiRUS)';
            let gender = 'Female';
            let ssml = `<speak version='1.0' xml:lang='${locale}'>
                            <voice name='${name}' xml:lang='${locale}' xml:gender='${gender}'>${text}</voice>
                            </speak>`;
            let baseRequest = request.defaults({
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/ssml+xml;charset=utf-8',
                    'Content-Length': ssml.length,
                    'X-Microsoft-OutputFormat': this.AUDIO_OUTPUT_FORMAT,
                    'X-Search-AppId': '00000000000000000000000000000000',
                    'X-Search-ClientID': '00000000000000000000000000000000',
                    'User-Agent': 'bingspeech-api-client'
                },
                timeout: 15000,
                encoding: null,
                body: ssml
            });
            return baseRequest.post(this.BING_SPEECH_ENDPOINT_TTS);
        })
            .then(result => {
            let response = {
                wave: result
            };
            return response;
        })
            .catch((err) => {
            throw new Error(`Voice synthesis failed miserably: ${err.message}`);
        });
    }
    issueToken() {
        if (this.token && this.tokenExpirationDate > Date.now()) {
            debug('reusing existing token');
            return Promise.resolve(this.token);
        }
        debug('issue new token for subscription key %s', this.subscriptionKey);
        let baseRequest = request.defaults({
            headers: {
                'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                'Content-Length': 0
            },
            timeout: 5000
        });
        return baseRequest.post(this.BING_SPEECH_TOKEN_ENDPOINT);
    }
}
exports.BingSpeechClient = BingSpeechClient;
//# sourceMappingURL=client.js.map