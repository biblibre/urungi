const gulp = require('gulp');
const concat = require('gulp-concat');
const decomment = require('gulp-decomment');
const gettext = require('gulp-angular-gettext');
const templatecache = require('gulp-angular-templatecache');
const merge = require('merge-stream');
const del = require('del');
const path = require('path');

const dist_js = gulp.series(dist_js_clean, dist_js_build);
const dist_css = gulp.series(dist_css_clean, dist_css_build);
const dist_fonts = gulp.series(dist_fonts_clean, dist_fonts_build);
const dist_translations = gulp.series(dist_translations_clean, dist_translations_build);
const dist_templates = gulp.series(dist_templates_clean, dist_templates_build);

const dist = gulp.parallel(
    dist_js,
    dist_css,
    dist_fonts,
    dist_translations,
    dist_templates,
);

module.exports = {
    'default': dist,
    'dist': dist,
    'dist:js': dist_js,
    'dist:css': dist_css,
    'dist:fonts': dist_fonts,
    'dist:translations': dist_translations,
    'dist:templates': dist_templates,
    'pot': pot,
    'po:update': gulp.series(pot, po_update),
    'watch:templates': watch_templates,
};

function dist_js_clean () {
    return del('dist/js/*');
}

function dist_css_clean () {
    return del('dist/css/*');
}

function dist_fonts_clean () {
    return del('dist/fonts/*');
}

function dist_translations_clean () {
    return del('dist/translations/*');
}

function dist_templates_clean () {
    return del('dist/templates/*');
}

function dist_js_build () {
    const paths = [
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
        'node_modules/angularjs-bootstrap-datetimepicker/src/js/datetimepicker.js',
        'node_modules/angularjs-bootstrap-datetimepicker/src/js/datetimepicker.templates.js',
        'node_modules/numeral/min/numeral.min.js',
        'node_modules/angular-ui-tree/dist/angular-ui-tree.min.js',
        'node_modules/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
        'node_modules/angular-ui-sortable/dist/sortable.min.js',
        'node_modules/ui-select/dist/select.min.js',
        'node_modules/d3/d3.min.js',
        'node_modules/c3/c3.min.js',
        'node_modules/angular-xeditable/dist/js/xeditable.min.js',
        'node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js',
        'node_modules/clipboard/dist/clipboard.min.js',
        'node_modules/ngclipboard/dist/ngclipboard.min.js',
        'node_modules/ng-file-upload/dist/ng-file-upload.min.js',
        'node_modules/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
        'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
        'node_modules/angular-gettext/dist/angular-gettext.min.js',
        'node_modules/cynteka-pivot-table-jquery/dist/jquery.cy-pivot.min.js',
    ];

    const bundle = gulp.src(paths)
        .pipe(decomment())
        .pipe(concat('bundle.min.js'))
        .pipe(gulp.dest('dist/js'));

    const copy = gulp.src([
        'node_modules/js-xlsx/dist/xlsx.core.min.js',
        'node_modules/jsPlumb/dist/js/jquery.jsPlumb-1.7.6-min.js',
    ])
        .pipe(decomment())
        .pipe(gulp.dest('dist/js'));

    return merge(bundle, copy);
}

function dist_css_build () {
    const paths = [
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'node_modules/ui-select/dist/select.min.css',
        'node_modules/bootstrap-datepicker/dist/css/bootstrap-datepicker.min.css',
        'node_modules/angularjs-bootstrap-datetimepicker/src/css/datetimepicker.css',
        'node_modules/angular-ui-tree/dist/angular-ui-tree.min.css',
        'node_modules/c3/c3.min.css',
        'node_modules/angular-xeditable/dist/css/xeditable.min.css',
        'node_modules/angular-bootstrap-colorpicker/css/colorpicker.min.css',
        'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css',
        'node_modules/cynteka-pivot-table-jquery/dist/jquery.cy-pivot.min.css',
        'node_modules/font-awesome/css/font-awesome.min.css',
    ];

    return gulp.src(paths)
        .pipe(concat('bundle.min.css'))
        .pipe(gulp.dest('dist/css'));
}

function dist_fonts_build () {
    const paths = [
        'node_modules/font-awesome/fonts/*',
        'node_modules/bootstrap/fonts/*',
    ];

    return gulp.src(paths)
        .pipe(gulp.dest('dist/fonts'));
}

function dist_translations_build () {
    return gulp.src(['language/*.po'])
        .pipe(gettext.compile({ format: 'json' }))
        .pipe(gulp.dest('dist/translations'));
}

function dist_templates_build () {
    // Using a single glob `public/partials/**/*.html` breaks the file order
    // and produce a different file even if no templates have changed.
    // By listing explicitely all directories we ensure that it does not happen.
    const globs = [
        'public/partials/core/*.html',
        'public/partials/dashboards/*.html',
        'public/partials/dashboardv2/*.html',
        'public/partials/data-sources/*.html',
        'public/partials/directives/*.html',
        'public/partials/files/*.html',
        'public/partials/home/*.html',
        'public/partials/io/*.html',
        'public/partials/layer/*.html',
        'public/partials/layers/*.html',
        'public/partials/logout/*.html',
        'public/partials/report/*.html',
        'public/partials/report/directives/*.html',
        'public/partials/report/modals/*.html',
        'public/partials/report/partials/*.html',
        'public/partials/reports/*.html',
        'public/partials/roles/*.html',
        'public/partials/sidebar/*.html',
        'public/partials/spaces/*.html',
        'public/partials/users/*.html',
        'public/partials/widgets/*.html',
    ];
    const base = path.join(__dirname, 'public', 'partials');

    return gulp.src(globs, { base: base })
        .pipe(templatecache({
            root: 'partials',
            module: 'app.templates',
            standalone: true,
            moduleSystem: 'IIFE',
        }))
        .pipe(gulp.dest('dist/templates'));
}

function pot () {
    return gulp.src(['public/js/**/*.js', 'public/partials/**/*.html'], { base: '.' })
        .pipe(gettext.extract('template.pot'))
        .pipe(gulp.dest('language'));
}

function po_update () {
    const fs = require('fs');
    const util = require('util');
    const child_process = require('child_process');

    const exec = util.promisify(child_process.exec);
    const readdir = util.promisify(fs.readdir);

    return readdir('language').then(files => {
        const promises = files
            .filter(file => file.endsWith('.po'))
            .map(file => exec('msgmerge --quiet --backup=none -U language/' + file + ' language/template.pot'));

        return Promise.all(promises);
    });
}

function watch_templates () {
    gulp.watch('public/partials/**/*.html', dist_templates);
}
