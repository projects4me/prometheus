/*
 * Projects4Me Copyright (c) 2017. Licensing : http://legal.projects4.me/LICENSE.txt. Do not remove this line
 */
module.exports = {
    test_page: 'tests/index.html?hidepassed',
    disable_watching: true,
    launch_in_ci: [
        'Chrome'
    ],
    launch_in_dev: [
        'Chrome'
    ],
    browser_args: {
        Chrome: {
            mode: 'ci',
            args: [
                // --no-sandbox is needed when running Chrome inside a container
                process.env.TRAVIS ? '--no-sandbox' : null,

                '--disable-gpu',
                '--headless',
                '--remote-debugging-port=0',
                '--window-size=1440,900'
            ].filter(Boolean)
        }
    }
};