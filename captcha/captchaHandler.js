var captchaParser = require("./CaptchaParser");
var unirest = require('unirest');
var consts = require('../consts');
var fs = require('fs');

/* GET home page. */
function parseCaptcha(callback) {

    const onCaptchaRequest = function (response) {
        var pixelmap = captchaParser.getPixelMapFromBuffer(response.body);

        const key = Object.keys(response.cookies)[0];
        const cookieSerial = key + "=" + response.cookies[key];
        console.log(cookieSerial);

        return callback(captchaParser.getCaptcha(pixelmap), cookieSerial);
    };

    Request = unirest.get(consts.captcha_link)
        .encoding(null)
        .timeout(26000)
        .end(onCaptchaRequest);
}

exports.parseCaptcha = parseCaptcha;
