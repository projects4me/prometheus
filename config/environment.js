/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* jshint node: true */

/**
 * These are application configurations
 *
 * @param environment
 * @return {{modulePrefix: string, environment: *, rootURL: string, locationType: string, api: {version: string, clientId: string, clientSecret: string, prefix: string, host: string}, app: {list: {pagelimit: number}, logger: {level: string, default: boolean}}, chat: {host: string, port: string, protocol: string}, emberFullCalendar: {schedulerLicenseKey: string}, EmberENV: {FEATURES: {}, EXTEND_PROTOTYPES: {Date: boolean}}, APP: {}}}
 */
module.exports = function(environment) {
    let ENV = {
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
        'ember-websockets': {
            socketIO: true
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
        ENV.APP.autoboot = false;
    }

    // if (environment === 'production') {
    //
    // }

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