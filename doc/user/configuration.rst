Configuration
=============

Urungi uses `config <https://www.npmjs.com/package/config>`_ to manage its
configuration files.

You can change the configuration by creating a file in ``config/`` directory named
``local-{env}.js`` (where ``{env}`` is one of: ``production``, ``development``) and
overriding any properties defined in ``config/default.js``.

More info at https://github.com/lorenwest/node-config/wiki/Configuration-Files.
