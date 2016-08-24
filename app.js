var fs = require('fs');
var cheerio = require('cheerio');
var captchaHandler = require("./captcha/captchaHandler");
var unirest = require('unirest');
var consts = require('./consts');

function authenticate(regno, pass, callback){

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

  const onSubmitPost = function (response) {

    var $ = cheerio.load(response.body);
    tables = $('table');
    table = $(tables[1]);
    children = table.children();
    child = $(children[0]);
    user_info_string = child.text().trim();
    user_info_arr = user_info_string.split(' ');
    name = user_info_arr[1].trim();
    for(var k = 2; k<=user_info_arr.length - 5; k++){
      name = name + " ";
      name = name + user_info_arr[k];
    }
    regno = user_info_arr[user_info_arr.length-3];
    unirest.get(consts.stud_login_home)
        .jar(cookieJ)
        .timeout(28000)
        .end(onSubmitHome);
  };

  const onSubmitHome = function (response) {
    callback(name, regno, cookieJ);
  };
}

module.exports = {auth: authenticate};
