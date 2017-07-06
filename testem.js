/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/*jshint node:true*/
module.exports = {
  "framework": "qunit",
  "test_page": "tests/index.html?hidepassed",
  "disable_watching": true,
  "launch_in_ci": [
//    "Firefox"
    "PhantomJS"
  ],
  "launch_in_dev": [
    "PhantomJS",
//    "Chrome"
  ]
};
