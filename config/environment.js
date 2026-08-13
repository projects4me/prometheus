/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */

/* jshint node: true */

/**
 * These are application configurations
 *
 * @param environment
 * @return {{modulePrefix: string, environment: *, rootURL: string, locationType: string, api: {version: string, clientId: string, clientSecret: string, prefix: string, host: string}, app: {list: {pagelimit: number}, logger: {level: string, default: boolean}}, hermes: {url: string}, emberFullCalendar: {schedulerLicenseKey: string}, EmberENV: {FEATURES: {}, EXTEND_PROTOTYPES: {Date: boolean}}, APP: {}}}
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
            prefix: 'app'
        },
        app:{
            list:{
                pagelimit:20
            },
            logger:{
                level:'DEBUG',
                default:true
            },
            dateFormat: "YYYY-MM-DD",
            notifications: {
                enableNav: true // Controls whether clicking notifications navigates to their links
            },
            upload: {
                maxFileSize: 2097152, // 2MB (general uploads)
                profilePicture: {
                    maxFileSize: 2097152, // 2MB
                    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
                }
            },
        },
        // Socket.IO origin for the Hermes live-updates relay (see utils/live/url.js)
        hermes: {
            url: process.env.HERMES_URL || 'http://localhost:9000'
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
        },

        'ember-cli-mirage': {
            enabled: false
        },
        
        publicRoutes: ['reset-password']
    };

    if (environment === 'development') {
        ENV.api.host = process.env.API_HOST_DEV;
        ENV.hermes.url = process.env.HERMES_URL_DEV || ENV.hermes.url;
    }

    if (environment === 'test') {
        // Testem prefers this...
        ENV.api.host = "http://test.projects4me";
        ENV.locationType = 'none';
        ENV.app.notifications.enableNav = false;

        // keep test console output quieter
        ENV.APP.LOG_ACTIVE_GENERATION = false;
        ENV.APP.LOG_VIEW_LOOKUPS = false;

        ENV.APP.rootElement = '#ember-testing';
        ENV.APP.autoboot = false;

        ENV['ember-cli-mirage'] = {
            enabled: true
        };
    }

    if (environment === 'production') {
        ENV.api.host = process.env.API_HOST_PRODUCTION;;
        ENV.hermes.url = process.env.HERMES_URL_PRODUCTION || ENV.hermes.url;
    }
    return ENV;
};
