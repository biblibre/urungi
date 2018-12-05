const gulp = require('gulp');
const concat = require('gulp-concat');
const decomment = require('gulp-decomment');
const merge = require('merge-stream');
const del = require('del');

gulp.task('clean', function () {
    return del('dist/**/*');
});

gulp.task('dist:js', ['clean'], function () {
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
        'node_modules/angular-bootstrap-datetimepicker/src/js/datetimepicker.js',
        'node_modules/numeral/min/numeral.min.js',
        'node_modules/angular-ui-tree/dist/angular-ui-tree.min.js',
        'node_modules/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'node_modules/angular-ui-bootstrap/ui-bootstrap-tpls.min.js',
        'node_modules/angular-ui-sortable/dist/sortable.min.js',
        'node_modules/ui-select/dist/select.min.js',
        'node_modules/d3/d3.min.js',
        'node_modules/c3/c3.min.js',
        'node_modules/angular-loading-overlay/dist/angular-loading-overlay.js',
        'node_modules/angular-xeditable/dist/js/xeditable.min.js',
        'node_modules/ng-file-upload/dist/ng-file-upload-shim.min.js',
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
});

gulp.task('dist:css', ['clean'], function () {
    const paths = [
        'node_modules/bootstrap/dist/css/bootstrap.min.css',
        'node_modules/ui-select/dist/select.min.css',
        'node_modules/angular-bootstrap-datetimepicker/src/css/datetimepicker.css',
        'node_modules/angular-ui-tree/dist/angular-ui-tree.min.css',
        'node_modules/c3/c3.min.css',
        'node_modules/angular-xeditable/dist/css/xeditable.min.css',
        'node_modules/angular-bootstrap-colorpicker/css/colorpicker.min.css',
        'node_modules/malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css',
        'node_modules/cynteka-pivot-table-jquery/dist/jquery.cy-pivot.min.css',
    ];

    return gulp.src(paths)
        .pipe(concat('bundle.min.css'))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('dist', ['dist:css', 'dist:js']);

gulp.task('default', ['dist']);
