const gulp = require('gulp');
const angularGettext = require('gulp-angular-gettext');
const nodemon = require('gulp-nodemon');
const templatecache = require('gulp-angular-templatecache');
const del = require('del');
const path = require('path');
const mergeStream = require('merge-stream');
const child_process = require('child_process');
const { po } = require('gettext-parser');
const { Transform } = require('stream');
const Vinyl = require('vinyl');
const po2json = require('po2json');

const translations = gulp.series(translations_clean, translations_build, translations_esm_build);

const templatesModules = [
    'dashboard-edit',
    'dashboard-list',
    'dashboard-view',
    'inspector',
    'layer-edit',
    'layer-list',
    'report',
    'report-edit',
    'report-list',
    'report-view',
    'share',
    'table',
];

const templates = gulp.parallel(templatesModules.map(m => templates_compile(m)));

const defaultTask = gulp.parallel(
    css,
    translations,
    templates,
);

module.exports = {
    default: defaultTask,
    dev: gulp.parallel(watch_less, watch_templates, nodemon_start),
    css,
    translations,
    templates,
    doc,
    pot,
    'po:update': gulp.series(pot, po_update),
    'watch:doc': watch_doc,
    'watch:less': watch_less,
    'watch:templates': watch_templates,
    watch: gulp.parallel(watch_doc, watch_less, watch_templates),
};

function translations_clean () {
    return del('public/translations/*');
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
        .pipe(poToJs())
        .pipe(gulp.dest('public/translations'));
}

function translations_esm_build () {
    return gulp.src(['language/*.po'])
        .pipe(poToJs({ esm: true }))
        .pipe(gulp.dest('public/translations'));
}

function templates_compile (name) {
    const f = function () {
        const base = path.join(__dirname, 'public', 'partials');
        return gulp.src(`public/partials/${name}/*.html`, { base })
            .pipe(templatecache(name + '.templates.js', {
                root: 'partials',
                module: 'app.' + name,
                moduleSystem: 'IIFE',
            }))
            .pipe(gulp.dest('public/js/ng/' + name));
    };
    f.displayName = 'templates:' + name;
    return f;
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
    const streamJs = gulp.src(['public/js/**/*.js', 'server/**/*.js'], { base: '.' })
        .pipe(xgettextJs());
    const streamHtml = gulp.src(['public/partials/**/*.html'], { base: '.' })
        .pipe(angularGettext.extract('template.pot'));
    const streamLiquid = gulp.src(['views/**/*.liquid'], { base: '.' })
        .pipe(xgettextLiquid());

    const headers = {
        'project-id-version': 'Urungi',
        'content-type': 'text/plain; charset=utf-8',
        'content-transfer-encoding': '8bit',
    };

    return mergeStream(streamJs, streamHtml, streamLiquid)
        .pipe(concatPo('template.pot', { headers }))
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

function xgettextLiquid () {
    function addToTranslationObject (translationObject, { msgid, msgid_plural, token }) {
        if (!translationObject.translations[''][msgid]) {
            translationObject.translations[''][msgid] = {
                msgid,
                msgid_plural,
                msgstr: '',
                comments: {
                    reference: '',
                }
            };
        }

        const reference = path.relative(__dirname, token.file) + ':' + token.getPosition()[0];
        if (reference) {
            if (translationObject.translations[''][msgid].comments.reference) {
                translationObject.translations[''][msgid].comments.reference += '\n';
            }
            translationObject.translations[''][msgid].comments.reference += reference;
        }
    }

    return new Transform({
        objectMode: true,
        transform (file, encoding, callback) {
            const { TokenKind, Tokenizer } = require('liquidjs');
            const liquid = require('./server/config/liquid.js');

            const data = {
                charset: 'utf8',
                headers: {
                    'content-type': 'text/plain; charset=utf-8',
                    'content-transfer-encoding': '8bit',
                },
                translations: {
                    '': {},
                }
            };

            const tokenizer = new Tokenizer(file.contents.toString(), liquid.options.operatorsTrie, file.path);
            const tokens = tokenizer.readTopLevelTokens(liquid.options);
            const tagTokens = tokens.filter(t => t.kind === TokenKind.Tag);
            const translationTagTokens = tagTokens.filter(t => ['t', 'tn'].includes(t.name));
            for (const token of translationTagTokens) {
                const tokenizer = new Tokenizer(token.args);

                if (token.name === 't') {
                    const msgidToken = tokenizer.readQuoted();
                    if (msgidToken) {
                        const msgid = msgidToken.content;
                        addToTranslationObject(data, { msgid, token });
                    }
                } else if (token.name === 'tn') {
                    const msgidToken = tokenizer.readQuoted();
                    const msgidPluralToken = tokenizer.readQuoted();
                    if (msgidToken && msgidPluralToken) {
                        const msgid = msgidToken.content;
                        const msgid_plural = msgidPluralToken.content;
                        addToTranslationObject(data, { msgid, msgid_plural, token });
                    }
                }
            }
            file.contents = po.compile(data);
            callback(null, file);
        },
    });
}

function xgettextJs () {
    return new Transform({
        objectMode: true,
        transform (file, encoding, callback) {
            const relativePath = path.relative(__dirname, file.path);
            const cmd = 'xgettext -o - --from-code=UTF-8 --omit-header -L JavaScript -kt ' + relativePath;
            const po = child_process.execSync(cmd);
            file.contents = po;
            callback(null, file);
        },
    });
}

function concatPo (filename, options) {
    const translationObject = {
        charset: 'utf8',
        headers: options.headers || {},
        translations: {
            '': {},
        },
    };

    return new Transform({
        objectMode: true,
        transform (file, encoding, callback) {
            const data = po.parse(file.contents);
            for (const msgctxt in data.translations) {
                for (const msgid in data.translations[msgctxt]) {
                    if (!translationObject.translations[msgctxt]) {
                        translationObject.translations[msgctxt] = {};
                    }

                    if (!translationObject.translations[msgctxt][msgid]) {
                        translationObject.translations[msgctxt][msgid] = data.translations[msgctxt][msgid];
                        continue;
                    }

                    const fileMsg = data.translations[msgctxt][msgid];
                    if (!fileMsg.comments) {
                        continue;
                    }

                    const msg = translationObject.translations[msgctxt][msgid];
                    if (!msg.comments) {
                        msg.comments = {};
                    }

                    for (const key of ['translator', 'reference', 'extracted', 'flag', 'previous']) {
                        if (!fileMsg.comments[key]) {
                            continue;
                        }
                        const comments = msg.comments[key] ? msg.comments[key].split(/\r?\n|\r/) : [];
                        const fileComments = fileMsg.comments[key].split(/\r?\n|\r/);
                        const mergedComments = comments.concat(fileComments);
                        mergedComments.sort();
                        msg.comments[key] = mergedComments.join('\n');
                    }
                }
            }
            callback();
        },
        flush (callback) {
            const file = new Vinyl();
            file.path = path.join(file.base, filename);
            file.contents = Buffer.concat([
                po.compile(translationObject, { sort: true, foldLength: 0 }),
                Buffer.from('\n'),
            ]);
            callback(null, file);
        },
    });
}

function poToJs (options = {}) {
    return new Transform({
        objectMode: true,
        transform (file, encoding, callback) {
            const jsonData = po2json.parse(file.contents);
            const json = {};
            if ('' in jsonData) {
                json[''] = {
                    language: jsonData[''].language,
                    'plural-forms': jsonData['']['plural-forms']
                };
                delete jsonData[''];
            }

            for (const key in jsonData) {
                if (jsonData[key][1] !== '') {
                    json[key] = jsonData[key].length === 2 ? jsonData[key][1] : jsonData[key].slice(1);
                }
            }

            // Make it work in the browser and in Node
            if (options.esm) {
                const js = `export default ${JSON.stringify(json)}`;

                file.contents = Buffer.from(js);
                file.extname = '.esm.js';
            } else {
                const js = `(((r,f)=>{if(typeof module==="object"&&module.exports){module.exports=f();}else{r.Urungi.messages=f();}})(typeof self!=="undefined"?self:this,()=>(${JSON.stringify(json)})))`;

                file.contents = Buffer.from(js);
                file.extname = '.js';
            }
            callback(null, file);
        },
    });
}
