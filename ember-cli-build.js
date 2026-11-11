/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/*jshint node:true*/
/* global require, module */
var EmberApp = require('ember-cli/lib/broccoli/ember-app');
var sass = require('sass');
var MergeTrees = require('broccoli-merge-trees');
var BundledTranslations = require('./lib/bundled-translations');

module.exports = function (defaults) {
    let app = new EmberApp(defaults, {
        // translations/*.json become the module prometheus/utils/intl/bundled-translations
        trees: {
            app: new MergeTrees(['app', new BundledTranslations('translations')]),
        },
        // Add options here
        // ember-concurrency is a v2 addon: it needs the async-arrow task transform to compile task(async () => {})
        // ember-cli-code-coverage adds the istanbul plugin only when COVERAGE=true
        babel: {
            plugins: [
                require.resolve('ember-concurrency/async-arrow-task-transform'),
                ...require('ember-cli-code-coverage').buildBabelPlugin()
            ]
        },
        sassOptions: {
            implementation: sass
        },
        sourcemaps: {
            enabled: true,
            extensions: ['js']
        }
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

    app.import("vendor/pace/pace-options.js");
    app.import("vendor/pace/pace.min.js");
    app.import("vendor/jquery-ui/jquery-ui.min.js");
    app.import('node_modules/js-logger/src/logger.min.js');
    app.import('node_modules/bootstrap-sass/assets/javascripts/bootstrap.min.js');
    app.import("node_modules/jquery-mask-plugin/dist/jquery.mask.min.js");
    app.import("node_modules/jquery-slimscroll/jquery.slimscroll.min.js");
    app.import("node_modules/highlightjs/highlight.pack.min.js");
    app.import("node_modules/at.js/dist/js/jquery.atwho.min.js");
    app.import("vendor/quill/dist/quill.min.js");
    app.import("vendor/messenger/build/js/messenger.min.js");
    app.import("node_modules/chart.js/dist/chart.min.js");
    app.import("node_modules/color-hash/dist/color-hash.js");
    //    app.import("bower_components/summernote/dist/summernote.js");
    app.import("vendor/summernote/summernote.js");
    app.import("vendor/custom-charts/doughnut-chart.js");
    app.import("vendor/AdminLTE/dist/js/app.js");


    // CSS Imports
    app.import("node_modules/cropperjs/dist/cropper.min.css");
    return app.toTree();
};
