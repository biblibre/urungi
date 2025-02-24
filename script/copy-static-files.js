const fs = require('fs');
const path = require('path');

const srcRoot = path.join(__dirname, '..', 'node_modules');
const destRoot = path.join(__dirname, '..', 'public', 's');
const files = [
    { src: 'jquery/dist/jquery.min.js', dest: 'jquery/jquery.min.js' },
    { src: 'jquery-validation/dist/jquery.validate.min.js', dest: 'jquery-validation/jquery.validate.min.js' },
    { src: 'components-jqueryui/jquery-ui.min.js', dest: 'jquery-ui/jquery-ui.min.js' },
    { src: 'bootstrap/dist/js/bootstrap.min.js', dest: 'bootstrap/js/bootstrap.min.js' },
    { src: 'bootstrap/fonts/glyphicons-halflings-regular.eot', dest: 'bootstrap/fonts/glyphicons-halflings-regular.eot' },
    { src: 'bootstrap/fonts/glyphicons-halflings-regular.svg', dest: 'bootstrap/fonts/glyphicons-halflings-regular.svg' },
    { src: 'bootstrap/fonts/glyphicons-halflings-regular.ttf', dest: 'bootstrap/fonts/glyphicons-halflings-regular.ttf' },
    { src: 'bootstrap/fonts/glyphicons-halflings-regular.woff', dest: 'bootstrap/fonts/glyphicons-halflings-regular.woff' },
    { src: 'bootstrap/fonts/glyphicons-halflings-regular.woff2', dest: 'bootstrap/fonts/glyphicons-halflings-regular.woff2' },
    { src: 'angular/angular.min.js', dest: 'angular/angular.min.js' },
    { src: 'angular-sanitize/angular-sanitize.min.js', dest: 'angular-sanitize/angular-sanitize.min.js' },
    { src: '@pnotify/core/dist/PNotify.js', dest: 'pnotify-core/PNotify.js' },
    { src: '@pnotify/core/dist/PNotify.css', dest: 'pnotify-core/PNotify.css' },
    { src: '@pnotify/bootstrap3/dist/PNotifyBootstrap3.js', dest: 'pnotify-bootstrap3/PNotifyBootstrap3.js' },
    { src: '@pnotify/bootstrap3/dist/PNotifyBootstrap3.css', dest: 'pnotify-bootstrap3/PNotifyBootstrap3.css' },
    { src: '@pnotify/font-awesome4/dist/PNotifyFontAwesome4.js', dest: 'pnotify-fontawesome4/PNotifyFontAwesome4.js' },
    { src: 'moment/min/moment-with-locales.min.js', dest: 'moment/moment-with-locales.min.js' },
    { src: 'angular-ui-tree/dist/angular-ui-tree.min.js', dest: 'angular-ui-tree/angular-ui-tree.min.js' },
    { src: 'angular-ui-tree/dist/angular-ui-tree.min.css', dest: 'angular-ui-tree/angular-ui-tree.min.css' },
    { src: 'angular-file-saver/dist/angular-file-saver.bundle.min.js', dest: 'angular-file-saver/angular-file-saver.bundle.min.js' },
    { src: 'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js', dest: 'angular-ui-bootstrap/ui-bootstrap-tpls.js' },
    { src: 'angular-ui-sortable/dist/sortable.min.js', dest: 'angular-ui-sortable/sortable.min.js' },
    { src: 'ui-select/dist/select.min.js', dest: 'ui-select/select.min.js' },
    { src: 'ui-select/dist/select.min.css', dest: 'ui-select/select.min.css' },
    { src: 'd3/dist/d3.min.js', dest: 'd3/d3.min.js' },
    { src: 'c3/c3.min.js', dest: 'c3/c3.min.js' },
    { src: 'c3/c3.min.css', dest: 'c3/c3.min.css' },
    { src: 'ng-file-upload/dist/ng-file-upload-shim.min.js', dest: 'ng-file-upload/ng-file-upload-shim.min.js' },
    { src: 'ng-file-upload/dist/ng-file-upload.min.js', dest: 'ng-file-upload/ng-file-upload.min.js' },
    { src: 'clipboard/dist/clipboard.min.js', dest: 'clipboard/clipboard.min.js' },
    { src: 'angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js', dest: 'angular-bootstrap-colorpicker/bootstrap-colorpicker-module.min.js' },
    { src: 'angular-bootstrap-colorpicker/css/colorpicker.min.css', dest: 'angular-bootstrap-colorpicker/colorpicker.min.css' },
    { src: 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js', dest: 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.concat.min.js' },
    { src: 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css', dest: 'malihu-custom-scrollbar-plugin/jquery.mCustomScrollbar.css' },
    { src: 'intro.js/minified/intro.min.js', dest: 'intro.js/intro.min.js' },
    { src: 'intro.js/minified/introjs.min.css', dest: 'intro.js/introjs.min.css' },
    { src: 'numeral/min/numeral.min.js', dest: 'numeral/numeral.min.js' },
    { src: 'pivottable/dist/pivot.min.js', dest: 'pivottable/pivot.min.js' },
    { src: 'pivottable/dist/pivot.min.css', dest: 'pivottable/pivot.min.css' },
    { src: 'subtotal/dist/subtotal.min.js', dest: 'subtotal/subtotal.min.js' },
    { src: 'subtotal/dist/subtotal.min.css', dest: 'subtotal/subtotal.min.css' },
    { src: 'xlsx/dist/xlsx.core.min.js', dest: 'xlsx/xlsx.core.min.js' },
    { src: 'jsplumb/dist/js/jsplumb.min.js', dest: 'jsplumb/jsplumb.min.js' },
    { src: 'jsplumb/css/jsplumbtoolkit-defaults.css', dest: 'jsplumb/jsplumbtoolkit-defaults.css' },
    { src: 'font-awesome/css/font-awesome.min.css', dest: 'font-awesome/css/font-awesome.min.css' },
    { src: 'font-awesome/fonts/FontAwesome.otf', dest: 'font-awesome/fonts/FontAwesome.otf' },
    { src: 'font-awesome/fonts/fontawesome-webfont.eot', dest: 'font-awesome/fonts/fontawesome-webfont.eot' },
    { src: 'font-awesome/fonts/fontawesome-webfont.svg', dest: 'font-awesome/fonts/fontawesome-webfont.svg' },
    { src: 'font-awesome/fonts/fontawesome-webfont.ttf', dest: 'font-awesome/fonts/fontawesome-webfont.ttf' },
    { src: 'font-awesome/fonts/fontawesome-webfont.woff', dest: 'font-awesome/fonts/fontawesome-webfont.woff' },
    { src: 'font-awesome/fonts/fontawesome-webfont.woff2', dest: 'font-awesome/fonts/fontawesome-webfont.woff2' },
    { src: 'jstree/dist/jstree.min.js', dest: 'jstree/jstree.min.js' },
    { src: 'jstree/dist/themes/default/style.min.css', dest: 'jstree/themes/default/style.min.css' },
    { src: 'jstree/dist/themes/default/32px.png', dest: 'jstree/themes/default/32px.png' },
    { src: 'jstree/dist/themes/default/40px.png', dest: 'jstree/themes/default/40px.png' },
    { src: 'jstree/dist/themes/default/throbber.gif', dest: 'jstree/themes/default/throbber.gif' },
    { src: 'gettext.js/dist/gettext.iife.min.js', dest: 'gettext.js/gettext.iife.min.js' },
    { src: 'gettext.js/dist/gettext.esm.min.js', dest: 'gettext.js/gettext.esm.min.js' },
];

fs.rmSync(destRoot, { recursive: true, force: true });
for (const file of files) {
    const dest = path.join(destRoot, file.dest);
    const src = path.join(srcRoot, file.src);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
}
