module.exports = function (config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',

        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],

        // list of files / patterns to load in the browser
        files: [
            'node_modules/jquery/dist/jquery.min.js',
            'node_modules/jquery-validation/dist/jquery.validate.min.js',
            'node_modules/components-jqueryui/jquery-ui.min.js',
            'node_modules/bootstrap/dist/js/bootstrap.min.js',
            'node_modules/angular/angular.min.js',
            'node_modules/angular-sanitize/angular-sanitize.min.js',
            'node_modules/angular-draganddrop/angular-draganddrop.min.js',
            'node_modules/angular-route/angular-route.min.js',
            'node_modules/noty/js/noty/packaged/jquery.noty.packaged.min.js',
            'node_modules/angular-uuid2/dist/angular-uuid2.min.js',
            'node_modules/angular-vs-repeat/src/angular-vs-repeat.min.js',
            'node_modules/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js',
            'node_modules/moment/min/moment.min.js',
            'node_modules/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
            'node_modules/numeral/min/numeral.min.js',
            'node_modules/angular-ui-tree/dist/angular-ui-tree.min.js',
            'node_modules/angular-file-saver/dist/angular-file-saver.bundle.min.js',
            'node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.min.js',
            'node_modules/angular-ui-sortable/dist/sortable.min.js',
            'node_modules/ui-select/dist/select.min.js',
            'node_modules/angular-loading-overlay/dist/angular-loading-overlay.js',
            'node_modules/angular-xeditable/dist/js/xeditable.min.js',
            'node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js',
            'node_modules/ng-file-upload/dist/ng-file-upload.min.js',
            'node_modules/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
            'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
            'node_modules/angular-gettext/dist/angular-gettext.min.js',
            'node_modules/cynteka-pivot-table-jquery/dist/jquery.cy-pivot.min.js',
            'public/js/webapp.js',
            'public/js/core/core.module.js',
            'public/js/data-sources/data-sources.module.js',
            'public/js/**/*.js',
            'node_modules/angular-mocks/angular-mocks.js',
            'test/client/**/*.js',
        ],

        // list of files / patterns to exclude
        exclude: [
        ],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },

        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],

        // web server port
        port: 9876,

        // enable / disable colors in the output (reporters and logs)
        colors: true,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,

        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,

        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['jsdom'],

        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
