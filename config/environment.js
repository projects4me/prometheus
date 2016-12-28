/* Licensing : http://legal.projects4.me/LICENSE.txt, please don't remove :) */
/* jshint node: true */

module.exports = function(environment) {
  var ENV = {
    modulePrefix: 'prometheus',
    environment: environment,
    rootURL: '/',
    locationType: 'auto',
    api: {
      version: '1',
      clientId: 'projects4me',
      clientSecret: '06110fb83488715ca69057f4a7cedf93',
      prefix: 'app',
      host: "http://projects4me",
    },
    app:{
      list:{
        pagelimit:20
      },
      logger:{
        level:'DEBUG',
        default:true
      }
    },
    chat:{
      host:'localhost',
      port:'3000',
      protocol:'http'
    },
    emberFullCalendar: {
      schedulerLicenseKey: 'GPL-My-Project-Is-Open-Source'
    },
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      },
      EXTEND_PROTOTYPES: {
        // Prevent Ember Data from overriding Date.parse.
        Date: false
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };

  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {

  }

  ENV['ember-simple-auth'] = {
    authenticationRoute: 'signin',
    routeAfterAuthentication: 'app',
    routeIfAlreadyAuthenticated: 'app'
  };

  ENV.i18n = {
    defaultLocale: 'en'
  };
  return ENV;
};
