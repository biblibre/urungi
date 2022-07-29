const gulp = require('gulp');
const gettext = require('gulp-angular-gettext');
const nodemon = require('gulp-nodemon');
const templatecache = require('gulp-angular-templatecache');
const del = require('del');
const path = require('path');
const child_process = require('child_process');

const translations = gulp.series(translations_clean, translations_build);
const templates = gulp.series(templates_clean, templates_build);

const defaultTask = gulp.parallel(
    css,
    translations,
    templates,
);

module.exports = {
    default: defaultTask,
    dev: gulp.parallel(watch_less, watch_templates, nodemon_start),
    css: css,
    translations: translations,
    templates: templates,
    doc: doc,
    pot: pot,
    'po:update': gulp.series(pot, po_update),
    'watch:doc': watch_doc,
    'watch:less': watch_less,
    'watch:templates': watch_templates,
    watch: gulp.parallel(watch_doc, watch_less, watch_templates),
};

function translations_clean () {
    return del('public/translations/*');
}

function templates_clean () {
    return del('public/templates/*');
}

function css () {
    const less = require('gulp-less');

    return gulp.src('public/less/bootstrap.less')
        .pipe(less({
            paths: [
                path.join(__dirname, 'node_modules', 'bootstrap', 'less'),
            ],
        }))
        .pipe(gulp.dest('public/css'));
}

function translations_build () {
    return gulp.src(['language/*.po'])
        .pipe(gettext.compile({ format: 'json' }))
        .pipe(gulp.dest('public/translations'));
}

function templates_build () {
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
        .pipe(gulp.dest('public/templates'));
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
    gulp.watch('public/partials/**/*.html', templates);
}

function watch_less () {
    gulp.watch('public/less/*.less', css);
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
