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
    default: dist,
    dist: dist,
    'dist:js': dist_js,
    'dist:css': dist_css,
    'dist:fonts': dist_fonts,
    'dist:translations': dist_translations,
    'dist:templates': dist_templates,
    pot: pot,
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
        'node_modules/noty/lib/noty.min.js',
        'node_modules/moment/min/moment-with-locales.min.js',
        'node_modules/angularjs-bootstrap-datetimepicker/src/js/datetimepicker.js',
        'node_modules/angularjs-bootstrap-datetimepicker/src/js/datetimepicker.templates.js',
        'node_modules/angular-ui-tree/dist/angular-ui-tree.min.js',
        'node_modules/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'node_modules/angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
        'node_modules/angular-ui-sortable/dist/sortable.min.js',
        'node_modules/ui-select/dist/select.min.js',
        'node_modules/d3/dist/d3.min.js',
        'node_modules/c3/c3.min.js',
        'node_modules/angular-xeditable/dist/js/xeditable.min.js',
        'node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js',
        'node_modules/clipboard/dist/clipboard.min.js',
        'node_modules/ngclipboard/dist/ngclipboard.min.js',
        'node_modules/ng-file-upload/dist/ng-file-upload.min.js',
        'node_modules/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
        'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js',
        'node_modules/angular-gettext/dist/angular-gettext.min.js',
        'node_modules/intro.js/minified/intro.min.js',
        'node_modules/angular-intro.js/build/angular-intro.min.js',
        'node_modules/numeral/min/numeral.min.js',
        'node_modules/pivottable/dist/pivot.min.js',
        'node_modules/subtotal/dist/subtotal.min.js',
    ];

    const bundle = gulp.src(paths)
        .pipe(decomment())
        .pipe(concat('bundle.min.js'))
        .pipe(gulp.dest('dist/js'));

    const copy = gulp.src([
        'node_modules/js-xlsx/dist/xlsx.core.min.js',
        'node_modules/jsplumb/dist/js/jsplumb.min.js',
    ])
        .pipe(decomment())
        .pipe(gulp.dest('dist/js'));

    return merge(bundle, copy);
}

function dist_css_build () {
    var less = require('gulp-less');

    const bootstrap = gulp.src([
        'node_modules/bootstrap/less/alerts.less',
        'node_modules/bootstrap/less/badges.less',
        'node_modules/bootstrap/less/breadcrumbs.less',
        'node_modules/bootstrap/less/button-groups.less',
        'node_modules/bootstrap/less/buttons.less',
        'node_modules/bootstrap/less/carousel.less',
        'node_modules/bootstrap/less/close.less',
        'node_modules/bootstrap/less/code.less',
        'node_modules/bootstrap/less/component-animations.less',
        'node_modules/bootstrap/less/dropdowns.less',
        'node_modules/bootstrap/less/forms.less',
        'node_modules/bootstrap/less/glyphicons.less',
        'node_modules/bootstrap/less/grid.less',
        'node_modules/bootstrap/less/input-groups.less',
        'node_modules/bootstrap/less/jumbotron.less',
        'node_modules/bootstrap/less/labels.less',
        'node_modules/bootstrap/less/list-group.less',
        'node_modules/bootstrap/less/mixins.less',
        'node_modules/bootstrap/less/modals.less',
        'node_modules/bootstrap/less/navbar.less',
        'node_modules/bootstrap/less/navs.less',
        'node_modules/bootstrap/less/normalize.less',
        'node_modules/bootstrap/less/pager.less',
        'node_modules/bootstrap/less/pagination.less',
        'node_modules/bootstrap/less/panels.less',
        'node_modules/bootstrap/less/popovers.less',
        'node_modules/bootstrap/less/progress-bars.less',
        'node_modules/bootstrap/less/responsive-embed.less',
        'node_modules/bootstrap/less/responsive-utilities.less',
        'node_modules/bootstrap/less/scaffolding.less',
        'node_modules/bootstrap/less/tables.less',
        'node_modules/bootstrap/less/thumbnails.less',
        'node_modules/bootstrap/less/tooltip.less',
        'node_modules/bootstrap/less/type.less',
        'node_modules/bootstrap/less/utilities.less',
        'node_modules/bootstrap/less/variables.less',
        'node_modules/bootstrap/less/wells.less',
    ])
        .pipe(concat('bootstrap.less'))
        .pipe(less());

    const modulesCss = gulp.src([
        'node_modules/ui-select/dist/select.min.css',
        'node_modules/angularjs-bootstrap-datetimepicker/src/css/datetimepicker.css',
        'node_modules/angular-ui-tree/dist/angular-ui-tree.min.css',
        'node_modules/c3/c3.min.css',
        'node_modules/angular-xeditable/dist/css/xeditable.min.css',
        'node_modules/angular-bootstrap-colorpicker/css/colorpicker.min.css',
        'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css',
        'node_modules/font-awesome/css/font-awesome.min.css',
        'node_modules/jsplumb/css/jsplumbtoolkit-defaults.css',
        'node_modules/intro.js/minified/introjs.min.css',
        'node_modules/noty/lib/noty.css',
        'node_modules/noty/lib/themes/bootstrap-v4.css',
        'node_modules/pivottable/dist/pivot.min.css',
        'node_modules/subtotal/dist/subtotal.min.css',
    ]);

    return merge(bootstrap, modulesCss)
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
    return gulp.src(['public/js/**/*.js', 'public/partials/**/*.html', 'views/login.ejs'], { base: '.' })
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
