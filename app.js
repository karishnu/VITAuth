var fs = require('fs');
var cheerio = require('cheerio');
var captchaHandler = require("./captcha/captchaHandler");
var unirest = require('unirest');
var consts = require('./consts');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function authenticate(regno, pass, callback) {

    var name;
    var cookieJ = unirest.jar();

    captchaHandler.parseCaptcha(function (captcha, captcha_cookie) {
        cookieJ.add(unirest.cookie(captcha_cookie), consts.url_login_submit);

        unirest.post(consts.url_login_submit)
            .jar(cookieJ)
            .form({
                regno: regno,
                passwd: pass,
                vrfcd: captcha
            })
            .timeout(28000)
            .end(onSubmitPost);
    });

    const onSubmitHome = function (response) {
        if (response.body == null) {
            callback(null, null, null, {code: '140', message: 'VIT Server Down'});
        }
        else if(response.request.uri.pathname=="/student/default_check_message.asp"){
            callback(null, null, null, {code: '150', message: 'VIT Student Login Blocked'});
        }
        else {
            callback(name, regno, cookieJ, null);
        }
    };

    const onSubmitPost = function (response) {

        if (response.body == null) {
            callback(null, null, null, {code: '140', message: 'VIT Server Down'});
        }
        else {

            //console.log(response.body);

            var $ = cheerio.load(response.body);
            tables = $('table');
            table = $(tables[2]);

            tr = $(table).children()['0'];
            tr_children = $(tr).children();

            if ($($(tr_children['0']).children()['4'])['0'] && $($(tr_children['0']).children()['4'])['0'].attribs.name == "stud_login") {
                callback(null, null, null, {code: '130', message: 'Invalid Credentials'})
            }
            else {
                //console.log("Valid creds");
                table = $(tables[1]);
                children = table.children();
                child = $(children[0]);
                user_info_string = child.text().trim();
                user_info_arr = user_info_string.split(' ');
                name = user_info_arr[1].trim();
                for (var k = 2; k <= user_info_arr.length - 5; k++) {
                    name = name + " ";
                    name = name + user_info_arr[k];
                }
                regno = user_info_arr[user_info_arr.length - 3];
                unirest.get(consts.stud_login_home)
                    .jar(cookieJ)
                    .timeout(28000)
                    .end(onSubmitHome);
            }
        }
    }
}

module.exports = {auth: authenticate};
