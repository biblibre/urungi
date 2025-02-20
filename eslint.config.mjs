import globals from 'globals';
import js from '@eslint/js';
import pluginJest from 'eslint-plugin-jest';
import pluginPromise from 'eslint-plugin-promise'

export default [
    js.configs.recommended,
    pluginPromise.configs['flat/recommended'],
    {
        rules: {
            'no-unused-vars': [
                'error',
                {
                    args: 'none',
                }
            ],
            'promise/always-return': 'off',
            'promise/catch-or-return': 'off',
            'promise/no-callback-in-promise': 'off',
            'promise/no-nesting': 'off',
        },
    },
    {
        files: ['test/**/*.js'],
        ...pluginJest.configs['flat/recommended'],
    },
    {
        files: ['{config,migrations,script,server,shared,src,test}/**/*.js', '*.js'],
        languageOptions: {
            globals: {
                ...globals.node,
            }
        },
    },
    {
        files: ['public/js/**/*.js', 'shared/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                module: 'readonly',
                $: 'readonly',
            },
        },
    },
    {
        files: ['public/js/ng/**/*.js'],
        languageOptions: {
            globals: {
                angular: 'readonly',
                layerUtils: 'readonly',
            },
        },
    },
    {
        files: ['test/client/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
                angular: 'readonly',
                inject: 'readonly',
                $: 'readonly',
            }
        },
    },
    {
        files: ['test/front/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser,
            }
        },
    },
    {
        ignores: [
            'public/s/*',
            'public/js/ng/**/*.templates.js',
            'public/translations/*',
            'doc/user/_build/*',
        ],
    },
];
