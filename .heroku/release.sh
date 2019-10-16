#!/bin/sh

npx migrate-mongo up
node .heroku/seed-postgresql-database.js
node .heroku/insert-datasource-and-layer.js
