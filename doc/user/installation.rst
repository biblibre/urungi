Installation
============

Requirements
------------

* `nodejs <https://nodejs.org>`_ (>= 12.x) and `npm <https://www.npmjs.com>`_
* `MongoDB <https://www.mongodb.org>`_ (>= 4.0)


Installation
------------

1. Install the requirements listed above
2. Clone the github repository

   .. code-block:: sh

      git clone https://github.com/biblibre/urungi.git
      cd urungi

3. Download and install dependencies

   .. code-block:: sh

      # In development environment
      npm ci

      # In production environment
      npm ci --only=production

4. Run MongoDB migrations

   .. code-block:: sh

      # In development environment
      npx migrate-mongo up

      # In production environment
      NODE_ENV=production npx migrate-mongo up

5. (Optional but recommended) Create a local config file and change the
   session's secret (see :doc:`configuration`)

.. note::

   If you are going to use oracle connections, Oracle Client libraries must be
   installed. To get those libraries, install an Instant Client Basic or Basic
   Light package from
   https://www.oracle.com/database/technologies/instant-client/downloads.html

   Installation instructions:
   https://oracle.github.io/node-oracledb/INSTALL.html
