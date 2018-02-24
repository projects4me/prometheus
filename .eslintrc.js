module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module'
    },
    plugins: [
        'ember'
    ],
    extends: [
        'eslint:recommended',
       'plugin:ember/recommended'
    ],
    env: {
        browser: true
    },
    rules: {
        "ember/avoid-leaking-state-in-ember-objects": "off",
        "ember/no-function-prototype-extensions": "off",
        "ember/closure-actions": "off",
        "deprecated-inline-view-helper": "off"
},
    overrides: [
        // node files
        {
            files: [
                'testem.js',
                'ember-cli-build.js',
                'config/**/*.js',
                'lib/*/index.js'
            ],
            parserOptions: {
                sourceType: 'script',
                ecmaVersion: 2015
            },
            env: {
                browser: false,
                node: true
            }
        }
    ],
    globals: {
        "moment": true,
        "Prometheus": true,
        "document": true,
        "window": true,
        "Pace": true,
        "Logger": true,
        "Quill": true,
        "hljs": true,
        "Messenger": true,
        "Chart": true,
        "ColorHash": true
    }
};
