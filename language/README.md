This is the procedure to follow in order to use translation in Urungi.

# 1 - Add translate tags in the html and javascript files

There are three ways to have a string be translated :
 * The "translate" tag can be added in any html element to translate the content
   of that element
 * the "translate" filter can be used in any expression evaluated by angularJS
 * the "i18n.gettext" function can be used to translate strings stored in a
   javascript file

# 2 - Extract the strings to translate

If gulp is not installed yet, install it with the following command:

    npm install gulp-cli -g

The command to extract all strings is

    gulp pot

This will generate the file language/template.pot

# 3 - create the translation

Use software like Poedit to create or update translations based on the
template.pot file.
All translations must be stored as .po files in the language folder.

To add new strings in po files, you can use this command:

    gulp po:update

# 4 - compile the translation

The command is

    gulp translations

This will update urungi with the new translations.

If you add a new language, add the language option in `server/app.js` and
`server/config/gettext.js`
