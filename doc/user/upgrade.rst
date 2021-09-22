Upgrade
=======

To upgrade Urungi to the latest version, follow these steps:

1. Update sources

   .. code-block:: sh

      git pull --rebase

2. Update dependencies

   .. code-block:: sh

      # In development environment
      npm ci

      # In production environment
      npm ci --only=production

3. Update database

   .. code-block:: sh

      # In development environment
      npx migrate-mongo up

      # In production environment
      NODE_ENV=production npx migrate-mongo up

4. Restart the server
