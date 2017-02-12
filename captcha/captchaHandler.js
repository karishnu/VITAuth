var captchaParser = require("./CaptchaParser");
var unirest = require('unirest');
var consts = require('../consts');

function parseCaptcha(url_captcha, callback) {

    const onCaptchaRequest = function (response) {

        if (response.body == null) {
            unirest.get(consts.captcha_link)
                .encoding(null)
                .timeout(26000)
                .end(onCaptchaRequest);
        }
        else {

            var pixelmap = captchaParser.getPixelMapFromBuffer(response.body);

            const key = Object.keys(response.cookies)[0];
            const cookieSerial = key + "=" + response.cookies[key];
            console.log(cookieSerial);

            return callback(captchaParser.getCaptcha(pixelmap), cookieSerial);
        }
    };

    unirest.get(url_captcha)
        .encoding(null)
        .timeout(26000)
        .end(onCaptchaRequest);
}

exports.parseCaptcha = parseCaptcha;
