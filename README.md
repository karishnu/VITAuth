# VITAuth

VITAuth is an authentication module that uses the VIT University Student Login for authentication (vtop.vit.ac.in). 
It is aimed at simplifying scraping and login tasks. 
Takes care of the captcha and returns a cookieJar with the authenticated cookie.

#Download

npm install vitauth

#Usage
    
    var Auth = require('vitauth');
    
    Auth.auth('sample_reg_no', 'sample_pass', function (name, regno, cookieJ, err) {
        unirest.get(sample_vtop_link)
            .jar(cookieJar)
            .timeout(28000)
            .end(sample_function);
    });
    
#Credits

Karthik Balakrishnan - Captcha parser without which this would have been impossible.
https://github.com/karthikb351/CaptchaParser
