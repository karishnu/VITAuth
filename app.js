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

    authenticate(data, url, callback, 0);
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

    authenticate(data, url, callback, 0);
}

function authenticate(data, url_login, callback, no_tries) {
    if(no_tries >= 10)
        return callback(null, null, null, {
            code: '160',
            message: 'No of Tries exceedeed'
        })

    var name;
    var cookieJ = unirest.jar();

    captchaHandler.parseCaptcha(url_login.captcha, function (captcha, captcha_cookie) {
        cookieJ.add(unirest.cookie(captcha_cookie), url_login.submit);
        data.vrfcd = captcha;
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
                    authenticate(data, url_login, callback, no_tries + 1);
                }
                else if(hidden_object.attribs.value == 'Your ward account is locked.'){
                    callback(null, null, null, {
                        code: '170',
                        message: 'Account Locked'
                    });
                } 
                else {                    
                    callback(null, null, null, {
                        code: '130',
                        message: 'Invalid Credentials'
                    });
                }
            } else {
                var user_info_string = $('font[size=2]')['0'].children[0].data.trim();
                var user_info_arr = user_info_string.split(' ');
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