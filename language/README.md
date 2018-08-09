This is the procedure to follow in order to use translation in Urungi.

# 1 - Add translate tags in the html and javascript files

There are three ways to have a string be translated :
 * The "translate" tag can be added in any html element to translate the content
   of that element
 * the "translate" filter can be used in any expression evaluated by angularJS
 * the "gettext" function can be used to translate strings stored in a
   javascript file

For more information, see https://angular-gettext.rocketeer.be/dev-guide/

# 2 - Extract the strings to translate

The command to do that is

> npm run-script gettext-extract

This will generate the file language/extract.pot

# 3 - create the translation

Use software like Poedit to create or update translations based on the
extract.pot file.
All translations must be stored as .po files in the language folder.

# 4 - compile the translation

The command is

> npm run-script gettext-compile

This will update urungi with the new translations.
