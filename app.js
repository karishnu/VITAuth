var fs = require('fs');
var cheerio = require('cheerio');
var captchaHandler = require("./captcha/captchaHandler");
var unirest = require('unirest');
var consts = require('./consts');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";


function authenticateStudent(regno, pass, callback) {
    var data = {
        regno: regno,
        passwd: pass
    }
    
    var url = {
        submit: consts.url_student_login_submit,
        home: consts.url_student_login_home,
        captcha: consts.url_student_captcha_link
    };    

    authenticate(data, url, callback);
}

function authenticateParent(regno, dob, mobile, callback){
    var data = {
        wdregno: regno,
        wdpswd: dob,
        wdmobno: mobile
    }

    var url = {
        submit: consts.url_parent_login_submit,
        home: consts.url_parent_login_home,
        captcha: consts.url_parent_captcha_link
    };

    authenticate(data, url, callback);
}

function authenticate(data, url_login, callback) {

    var name;
    var cookieJ = unirest.jar();

    captchaHandler.parseCaptcha(url_login.captcha, function (captcha, captcha_cookie) {
        cookieJ.add(unirest.cookie(captcha_cookie), url_login.submit);
        data.vrfcd = captcha;
        console.log(data);
        unirest.post(url_login.submit)
            .jar(cookieJ)
            .form(data)
            .timeout(28000)
            .end(onSubmitPost);
    });

    const onSubmitHome = function (response) {
        if (response.body == null) {
            callback(null, null, null, {
                code: '140',
                message: 'VIT Server Down'
            });
        } else if (response.request.uri.pathname == "/student/default_check_message.asp") {
            callback(null, null, null, {
                code: '150',
                message: 'VIT Student Login Blocked'
            });
        } else {
            callback(name, regno, cookieJ, null);
        }
    };

    const onSubmitPost = function (response) {

        if (response.body == null) {
            callback(null, null, null, {
                code: '140',
                message: 'VIT Server Down'
            });
        } else {
            var $ = cheerio.load(response.body, {
                ignoreWhitespace: true
            });
            var hidden_object = $('input[type="hidden"]')['0'];

            if (hidden_object) {
                if (hidden_object.attribs.value == 'Verification Code does not match.  Enter exactly as shown.' || 'Enter Verification Code of 6 characters exactly as shown.' == hidden_object.attribs.value) {
                    console.log("Captcha Error! Retrying!");
                    authenticate(data, url_login, callback);
                } else {
                    console.log(hidden_object.attribs.value);
                    
                    callback(null, null, null, {
                        code: '130',
                        message: 'Invalid Credentials'
                    });
                }
            } else {
                console.log("hello");
                var user_info_string = $('font[size=2]')['0'].children[0].data.trim();
                var user_info_arr = user_info_string.split(' ');
                console.log(user_info_arr);
                if(url_login.submit == consts.url_student_login_submit){
                name = user_info_arr[1];
                for (var k = 2; k <= user_info_arr.length - 5; k++) {
                    name = name + " ";
                    name = name + user_info_arr[k];
                }
                regno = user_info_arr[user_info_arr.length - 3];
                unirest.get(url_login.home)
                    .jar(cookieJ)
                    .timeout(28000)
                    .end(onSubmitHome);
                }
                else{
                    name = user_info_arr[2];
                for (var k = 3; k <= user_info_arr.length - 5; k++) {
                    name = name + " ";
                    name = name + user_info_arr[k];
                }
                    regno = user_info_arr[0];
                    callback(name, regno, cookieJ, null);
                }
            }
        }
    }
}

module.exports = {
    studentAuth: authenticateStudent,
    parentAuth: authenticateParent
};