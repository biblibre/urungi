const gulp = require('gulp');
const concat = require('gulp-concat');
const gettext = require('gulp-angular-gettext');
const templatecache = require('gulp-angular-templatecache');
const merge = require('merge-stream');
const del = require('del');
const path = require('path');

const dist_css = gulp.series(dist_css_clean, dist_css_build);
const dist_fonts = gulp.series(dist_fonts_clean, dist_fonts_build);
const dist_translations = gulp.series(dist_translations_clean, dist_translations_build);
const dist_templates = gulp.series(dist_templates_clean, dist_templates_build);

const dist = gulp.parallel(
    dist_css,
    dist_fonts,
    dist_translations,
    dist_templates,
);

module.exports = {
    default: dist,
    dist: dist,
    'dist:css': dist_css,
    'dist:fonts': dist_fonts,
    'dist:translations': dist_translations,
    'dist:templates': dist_templates,
    pot: pot,
    'po:update': gulp.series(pot, po_update),
    'watch:templates': watch_templates,
    'watch:less': watch_less,
    watch: gulp.parallel(watch_templates, watch_less),
};

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

function dist_css_build () {
    var less = require('gulp-less');

    return gulp.src('public/less/bootstrap.less')
        .pipe(less({
            paths: [
                path.join(__dirname, 'node_modules', 'bootstrap', 'less'),
            ],
        }))
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

function watch_less () {
    gulp.watch('public/less/*.less', dist_css);
}
