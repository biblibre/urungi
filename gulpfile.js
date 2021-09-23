const gulp = require('gulp');
const gettext = require('gulp-angular-gettext');
const nodemon = require('gulp-nodemon');
const templatecache = require('gulp-angular-templatecache');
const del = require('del');
const path = require('path');
const child_process = require('child_process');

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
    dev: gulp.parallel(watch_less, watch_templates, nodemon_start),
    dist: dist,
    'dist:css': dist_css,
    'dist:fonts': dist_fonts,
    'dist:translations': dist_translations,
    'dist:templates': dist_templates,
    doc: doc,
    pot: pot,
    'po:update': gulp.series(pot, po_update),
    'watch:doc': watch_doc,
    'watch:less': watch_less,
    'watch:templates': watch_templates,
    watch: gulp.parallel(watch_doc, watch_less, watch_templates),
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
    const less = require('gulp-less');

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

function nodemon_start (done) {
    nodemon({
        script: 'bin/www',
        ext: 'js',
        env: { NODE_ENV: 'development' },
        watch: [
            'server/',
        ],
        done
    });
}

function pot () {
    return gulp.src(['public/js/**/*.js', 'public/partials/**/*.html', 'views/login.ejs'], { base: '.' })
        .pipe(gettext.extract('template.pot'))
        .pipe(gulp.dest('language'));
}

function po_update () {
    const fs = require('fs');
    const util = require('util');

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

function watch_doc () {
    gulp.watch(['doc/user/**', '!doc/user/_build/**'], doc);
}

function doc (done) {
    const options = {
        env: Object.assign({
            SPHINXOPTS: '-q --color',
        }, process.env),
    };

    child_process.exec('make -C doc/user clean html', options, function (err, stdout, stderr) {
        if (err) {
            done(err);
            return;
        }

        process.stderr.write(stderr);
        done();
    });
}
