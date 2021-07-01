module.exports = {
  globals: {
    server: true,
  },
    root: true,
    parser: "babel-eslint",
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module',
        ecmaFeatures: {
            "jsx": true,
            "modules": true,
            "experimentalObjectRestSpread": true
        }
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
        "ember/no-observers": "off",
        "ember/no-jquery": "off",
        "ember/no-classic-classes": "off",
        "ember/no-classic-components": "off",
        "ember/require-tagless-components": "off",
        "ember/no-component-lifecycle-hooks": "off",
        "ember/require-super-in-lifecycle-hooks": "off",
        "ember/no-actions-hash": "off",
        "ember/require-computed-property-dependencies": "off",
        "ember/no-volatile-computed-properties": "off",
        
//        "ember/no-function-prototype-extensions": "off",
//        "ember/closure-actions": "off",
//        "ember/deprecated-inline-view-helper": "off"
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
    server: true,
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
