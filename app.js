var express = require('express');
var router = express.Router();
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var captcha = require("./captcha");
var unirest = require('unirest');
var tabletojson = require('tabletojson');

function authenticate(regno, pass, callback){
  console.log("Request Received!");

  var name;

  const url_login_submit = 'https://vtop.vit.ac.in/student/stud_login_submit.asp';
  const stud_login_home = 'https://vtop.vit.ac.in/student/stud_home.asp';

  var cookieJar = unirest.jar();

  captcha.parseCaptcha(function (captcha, captcha_cookie) {
    cookieJar.add(unirest.cookie(captcha_cookie), url_login_submit);

    unirest.post(url_login_submit)
        .jar(cookieJar)
        .form({
          regno: regno,
          passwd: pass,
          vrfcd: captcha
        })
        .timeout(28000)
        .end(onSubmitPost);
  });

  const onSubmitPost = function (response) {
    console.log(response.body);
    //console.log(response.getElementsByTagName('table'));
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
    console.log(name);
    regno = user_info_arr[user_info_arr.length-3];
    console.log(regno);
    unirest.get(stud_login_home)
        .jar(cookieJar)
        .timeout(28000)
        .end(onSubmitHome);
  };

  const onSubmitHome = function (response) {
    callback("pass");
  };
}

module.exports = {auth: authenticate};
