/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
    let app = new EmberApp(defaults, {
        // Add options here
    });

    // Use `app.import` to add additional libraries to the generated
    // output files.
    //
    // If you need to use different assets in different
    // environments, specify an object as the first parameter. That
    // object's keys should be the environment name and the values
    // should be the asset to use in that environment.
    //
    // If the library that you are including contains AMD or ES6
    // modules that you would like to import into your application
    // please specify an object with the list of modules as keys
    // along with the exports of each module as its value.

    app.import("vendor/pace/pace.min.js");
    app.import('bower_components/js-logger/src/logger.min.js');
    app.import('bower_components/bootstrap-sass/assets/javascripts/bootstrap.min.js');
    app.import("bower_components/jquery-cookie/jquery.cookie.js");
    app.import("bower_components/lodash/dist/lodash.min.js");
    app.import("bower_components/bootstrap-select/dist/js/bootstrap-select.min.js");
    app.import("bower_components/moment/moment.js");
    app.import("bower_components/bootstrap-daterangepicker/daterangepicker.js");
    app.import("bower_components/jQuery-Mask-Plugin/dist/jquery.mask.min.js");
    app.import("bower_components/doT/doT.min.js");
    app.import("bower_components/jquery-extendext/jQuery.extendext.min.js");
    app.import("bower_components/jQuery-QueryBuilder/dist/js/query-builder.min.js");
    app.import("bower_components/jquery-slimscroll/jquery.slimscroll.min.js");
    app.import("bower_components/highlightjs/highlight.pack.min.js");
    app.import("bower_components/Caret.js/dist/jquery.caret.min.js");
    app.import("bower_components/At.js/dist/js/jquery.atwho.min.js");
    app.import("vendor/quill/dist/quill.min.js");
    app.import("vendor/messenger/build/js/messenger.min.js");
    app.import("bower_components/fullcalendar/dist/locale-all.js");
    app.import("bower_components/chart.js/dist/Chart.min.js");
    app.import("bower_components/color-hash/dist/color-hash.js");
//    app.import("bower_components/summernote/dist/summernote.js");
    app.import("vendor/summernote/summernote.js");
    app.import("vendor/DataTables/datatables.min.js");

    app.import("vendor/AdminLTE/dist/js/app.js");
    return app.toTree();
};
