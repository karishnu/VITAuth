var express = require('express');
var cheerio = require('cheerio');
var captcha = require("./CaptchaParser");
var unirest = require('unirest');


var sslRootCAs = require('ssl-root-cas');

/* GET home page. */
function parseCaptcha(callback) {

    console.log("Captcha called!");

    var captcha_link = 'https://vtop.vit.ac.in/student/captcha.asp';

    const onCaptchaRequest = function (response) {

        console.log(response);

        var pixelmap = captcha.getPixelMapFromBuffer(response.body);

        const key = Object.keys(response.cookies)[0];
        const cookieSerial = key + "=" + response.cookies[key];
        console.log(cookieSerial);

        return callback(captcha.getCaptcha(pixelmap), cookieSerial);
    };

    Request = unirest.get(captcha_link)
        .encoding(null)
        .timeout(26000)
        .end(onCaptchaRequest);
}

exports.parseCaptcha = parseCaptcha;
