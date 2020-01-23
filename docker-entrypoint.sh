#!/bin/sh

npx migrate-mongo up
exec "$@"
