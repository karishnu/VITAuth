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
            .jar(cookieJ)
            .timeout(28000)
            .end(sample_function);
    });
    
#Credits

Karthik Balakrishnan - Captcha parser without which this would have been impossible.
https://github.com/karthikb351/CaptchaParser

#License

   Copyright 2016 Karishnu Poddar

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.