# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added a service for notifications called "notify" (based actually on PNotify)
- Added Spanish translation
- Added report type pyramid
- Added report type map
- Added gulp task `dev` that combine `watch` and `nodemon`

### Changed

- Replace Noty by custom notification service
- If no language is selected, use the language defined in browser preferences (#76)

### Fixed

- XLSX export now takes into account dynamic filters (#252)
- Logged in users that become inactive are no longer able to use the app and
  are redirected to the login page (#203)
- Report data is no longer displayed automatically if there is a mandatory filter

### Dependencies

- Added leaflet 1.7.1
- Updated angular to 1.8.2
- Updated angular-gettext to 2.4.2
- Updated arg to 5.0.1
- Updated c3 to 0.7.20
- Updated clipboard to 2.0.8
- Updated config to 3.3.6
- Updated connect-mongo to 4.5.0
- Updated cookie-parser to 1.4.5
- Updated csurf to 1.11.0
- Updated debug to 4.3.2
- Updated del to 6.0.0
- Updated ejs to 3.1.6
- Updated eslint to 7.32.0
- Updated eslint-config-standard to 16.0.3
- Updated eslint-plugin-import to 2.24.0
- Updated eslint-plugin-jest to 24.4.0
- Updated eslint-plugin-node to 11.1.0
- Updated eslint-plugin-promise to 5.1.0
- Updated express-session to 1.17.2
- Updated gulp-less to 5.0.0
- Updated htmlhint to 0.15.1
- Updated intro.js to 4.1.0
- Updated jest to 27.0.6
- Updated jquery to 3.6.0
- Updated jquery-validation to 1.19.3
- Updated jsplumb to 2.15.6
- Updated knex to 0.21.21
- Updated migrate-mongo to 8.2.3
- Updated moment to 2.29.1
- Updated mongodb-memory-server to 7.3.6
- Updated mongoose to 5.13.7
- Updated mssql to 6.3.2
- Updated multer to 1.4.3
- Updated mysql to 2.18.1
- Updated nodemailer to 6.6.3
- Updated oracledb to 5.2.0
- Updated passport to 0.4.1
- Updated password-generator to 2.3.2
- Updated pg to 8.7.1
- Updated request to 2.88.2
- Updated set-cookie-parser to 2.4.8
- Updated stylelint to 13.13.1
- Updated stylelint-config-standard to 22.0.0
- Updated supertest to 6.1.6
- Removed eslint-plugin-standard
- Removed gulp-concat
- Removed gulp-decomment
- Removed merge-stream

## [2.2.0] - 2020-04-01

### Added

- Added command line interface (bin/cli)
- Added ability to configure uploads path

### Changed

- scripts in script/ have been replaced by a command in the new CLI
- Dockerfile now takes a build arg `NODE_TAG`
- docker-compose.yml reads environment variables `NODE_TAG` and `MONGO_TAG`

### Fixed

- Fixed date filter when using patterns 'This month' and 'Last month'
- Sanitized user input used as regexp

### Removed

- Removed "Remember me" feature at login because it was not secure

### Dependencies

- Added arg 4.1.2
- Updated angular to 1.7.9
- Updated angular-mocks to 1.7.9
- Updated angular-route to 1.7.9
- Updated angular-sanitize to 1.7.9
- Updated eslint to 6.8.0
- Updated eslint-plugin-import to 2.20.0
- Updated eslint-plugin-jest to 23.6.0
- Updated eslint-plugin-node to 11.0.0
- Updated jest to 25.1.0
- Updated mongodb-memory-server to 6.2.3
- Updated mongoose to 5.8.6
- Updated oracledb to 4.1.0
- Updated set-cookie-parser to 2.4.1
- Updated stylelint to 13.0.0

## [2.1.0] - 2020-01-02

### Added

- Added ability to configure the number of workers

### Dependencies

- Updated migrate-mongo to 7.0.1

## [2.0.1] - 2019-12-20

### Fixed

- Fixed sharing a dashboard or a report inside a shared space folder
- Fixed shared space for non-admin users

### Changed

- Make users API routes more REST-like
- Disabled the default http.Server timeout of 120s

## [2.0.0] - 2019-11-29

### Important update information

- The new ability to export reports and dashboards as PDF/PNG requires a new
  dependency: [Pikitia](https://github.com/biblibre/pikitia)

  You need to install it and configure it by setting options `pikitia.url`,
  `pikitia.client_id`, `pikitia.client_secret` and `url` (see [Configuration
  section in README.md](README.md#configuration))

- **BREAKING** Node.js 8 and MongoDB 3.4 are no longer supported. Upgrade to
  Node.js 10 and MongoDB 3.6 (#208)

### Added

- Added ability to change a column's label in report (#39)
- Added ability to change column's format in report (for date and number) (#75)
- Added ability to export dashboards and reports as PNG or PDF (#41, #110)
- Added ability to calculate totals in grid and vgrid (#74)
- Added ability to select a theme for reports and dashboards (#109)
- Added ability to serve Urungi under a subdirectory (#139)

### Changed

- Move report columns settings into a modal
- Move report settings into a modal
- Use HTML table for building grid and vgrid
- Use PivotTable.js instead of cynteka for building pivot table (#71)
- Hide dashboard title on print (#165)
- Use asynchronous autocompletion for filters to avoid loading thousands of
  values (#132)

### Removed

- Removed the Advanced tab in layer element modification (modal and sidebar) (#150)

### Fixed

- Fix scripts first-time-setup and set-password
- Fix date filters for Oracle (#16)
- Fix a bug where report/dashboard/layer name modification was not always saved (#141)
- Fixed display issues for layers/reports/dashboards tables on small screens (#65)
- Use default aggregation set in layer when adding columns to a report
- Fixed drag and drop in dashboard (#37, #126, #146)
- Fixed role permissions modification (#197)

### Dependencies

- Added pivottable 2.23.0
- Added request 2.88.0
- Added subtotal 1.11.0-alpha.0
- Updated c3 to 0.7.11
- Updated config to 3.2.3
- Updated del to 5.1.0
- Updated ejs to 2.7.1
- Updated email-templates to 6.0.3
- Updated eslint to 6.6.0
- Updated eslint-config-standard to 14.1.0
- Updated eslint-plugin-import to 2.18.2
- Updated eslint-plugin-jest to 22.19.0
- Updated eslint-plugin-node to 10.0.0
- Updated eslint-plugin-standard to 4.0.1
- Updated express-session to 1.17.0
- Updated gulp-angular-gettext to 2.3.0
- Updated jest to 24.9.0 and forced graceful-fs to 4.2.2
- Updated jsplumb to 2.12.0
- Updated knex to 0.19.5
- Updated migrate-mongo to 6.0.2
- Updated mongodb-memory-server to 5.2.8
- Updated mongoose to 5.7.5
- Updated multer to 1.4.2
- Updated nodemailer to 6.3.1
- Updated oracledb to 4.0.1
- Updated pg to 7.12.1
- Updated set-cookie-parser to 2.4.0
- Updated stylelint to 11.1.1
- Updated stylelint-config-standard to 19.0.0
- Removed angular-draganddrop
- Removed angular-vs-repeat
- Removed angular-xeditable
- Removed codecov
- Removed cynteka-pivot-table-jquery
- Removed email-templates

## [1.2.2] - 2019-08-30

### Fixed

- Rebuilt JSON for french translations

## [1.2.1] - 2019-08-30

### Fixed

- Fixed a bug preventing to change the sort direction in report editor
- Fixed a bug that prevented the column's type (spline, bar, area, ...) to be
  saved
- Columns and rows of pivot table are now sorted
- Fixed a bug in SQL query builder when using date filters

## [1.2.0] - 2019-08-26

### Changed

- In Oracle layers, columns are now sorted by name

### Fixed

- Fixed queries with multiple filters
- Fixed a bug that prevented to add new columns to existing reports
- Fixed a bug that prevented editing reports after a modification of the layer
- Fixed the icon for date fields in report editor
- Fixed some graphical issues with grid and vGrid in dashboards

### Removed

- Removed deprecated JDBC connector for Oracle
- Removed deprecated connector for Google BigQuery
- Removed the datasource parameter 'packetsize', which was not used

## [1.1.1] - 2019-07-12

### Changed

- JDBC connector for Oracle have been deprecated and will be removed in the
  next version

  It is not tested, requires several build dependencies (openjdk, g++, make)
  and there is already an Oracle connector that works and is supported by knex.

- Connector for Google BigQuery have been deprecated and will be removed in the
  next version

  It is not tested, depends on an old non-maintained package, which itself
  depends on packages that have security issues.
  It might be reintroduced in the future though, if someone is willing to
  implement it using packages that do not have these problems

### Fixed

- Fixed an infinite $digest look when editing a report
- Fixed a weird bug where sometimes a click in layers/reports/dashboards list
  would do nothing
- Fixed runtime filters (#99)
- Fixed a bug preventing c3 to draw a pie/donut when there is a NULL value

### Dependencies

- Updated c3 to 0.7.2
- Updated jsplumb to 2.10.2
- Updated knex to 0.19.0
- Updated mongoose to 5.6.4
- Updated del to 5.0.0 (dev)
- Updated eslint-plugin-jest to 22.7.2 (dev)

## [1.1.0] - 2019-07-11

### Important update information

- CSRF protection

  This version adds protection against
  [CSRF](https://en.wikipedia.org/wiki/Cross-site_request_forgery).
  It is strongly recommended to upgrade.

- Session's secret is now configurable

  Previously hardcoded, the secret used to sign the session ID cookie is now
  configurable. Generate a random string and set it to key `session.secret` in
  your local-{env}.js config file

- Configuration object for `mailer` key has changed

  Check config/default.js and update your local-{env}.js config file
  accordingly

### Added

- Ability to make reports and dashboards public
- Added ability to change maximum value for gauge
- New icon set to be used in dashboards
- Legend in custom layer element modal to know which columns correspond to the
  cryptic IDs
- Added docker and docker-compose files
- SQL views can be added to layers (Oracle only)
- Added favicon

### Changed

- Move all "menu-list" code into several independent AngularJS components
- Use $uibModal and its component option to make it easier to reuse modals
- Cache all template files
- Date input for filters can be changed manually (without datetimepicker)
- Use uib-tabset everywhere we have tabs for consistency
- Browser's sessionStorage is not used anymore for user data
- Relocate 'datasourceID' property in layers and define explicit schema for
  layers, reports and dashboards
- Configuration object for `mailer` key has changed, check config/default.js
- Replace mocha and karma by jest for running tests
- Tables are now ordered alphabetically in the layer modification page
- Make import tool more picky and informative

### Fixed

- A compatibility issues between the jQuery plugin for pivot table and the
  recently upgraded jQuery 3
- Remove import error messages that were false positives
- A lot of minor issues raised by LGTM
- Wrong use of GROUP BY when the query does not use aggregation
- Fixed links to report/dashboard on home page
- Fixed date filters (between, not between, is null, is not null)

### Security

- Session's secret is now configurable
- Added CSRF protection

### Dependencies

- Added angular-intro.js
- Added clipboard
- Added codecov (dev)
- Added csurf
- Added eslint-plugin-jest (dev)
- Added gulp-angular-templatecache (dev)
- Added intro.js
- Added jest (dev)
- Added mongodb-memory-server (dev)
- Added ngclipboard
- Added oracledb
- Added set-cookie-parser (dev)
- Added supertest (dev)
- Updated angular, angular-route and angular-sanitize to 1.7.8
- Updated angular-mocks to 1.7.8 (dev)
- Updated angular-ui-bootstrap to 2.5.6 (major update)
- Updated angular-ui-sortable to 0.19.0
- Updated angular-vs-repeat to 2.0.13
- Updated angular-xeditable to 1.10.0
- Updated angularjs-bootstrap-datetimepicker to 1.1.4 (major update)
- Updated body-parser to 1.19.0
- Updated bootstrap to 3.4.1
- Updated c3 to 0.7.1
- Updated config to 3.1.0 (major update)
- Updated connect-mongo to 3.0.0 (major update)
- Updated cookie-parser to 1.4.4
- Updated debug to 4.1.1 (major update)
- Updated del to 4.1.1 (dev, major update)
- Updated ejs to 2.6.2
- Updated email-templates to 6.0.0 (major update)
- Updated eslint-plugin-import to 2.18.0 (dev)
- Updated eslint-plugin-node to 9.1.0 (dev, major update)
- Updated eslint-plugin-promise to 4.2.1 (dev)
- Updated express to 4.17.1
- Updated express-session to 1.16.2
- Updated gulp to 4.0.2 (dev)
- Updated jdbc to 0.6.4
- Updated jquery to 3.4.1
- Updated jquery-validation to 1.19.1
- Updated jsplumb to 2.10.1 (major update)
- Updated knex to 0.18.0
- Updated merge-stream to 2.0.0 (dev, major update)
- Updated migrate-mongo to 6.0.0 (major update)
- Updated mongoose to 5.6.2 (major update)
- Updated mssql to 5.1.0 (major update)
- Updated multer to 1.4.1
- Updated mysql to 2.17.1
- Updated nodemailer to 6.2.1 (major update)
- Updated noty to 3.2.0-beta (major update)
- Updated numeral to 2.0.6 (major update)
- Updated passport to 0.4.0
- Updated passport-google-oauth20 to 2.0.0 (major update)
- Updated password-generator to 2.2.0
- Updated pg to 7.11.0 (major update)
- Updated stylelint to 10.1.0 (dev)
- Removed angular-loading-overlay
- Removed angular-uuid2
- Removed async
- Removed bootstrap-datepicker
- Removed chai (dev)
- Removed chai-http (dev)
- Removed express-ejs-layouts
- Removed jasmine-core (dev)
- Removed jsdom (dev)
- Removed karma (dev)
- Removed karma-jasmine (dev)
- Removed karma-jsdom-launcher (dev)
- Removed mocha (dev)

## [1.0.1] - 2019-05-03

### Security

- Upgrade ejs to 2.6.1

## [1.0.0] - 2019-05-03

These are the most notable changes made since the fork of
[Widestage](https://github.com/widestage/widestage).

### Added

- New report type: pivot table
- New chart type: stacking bars
- New column aggregation: COUNT(DISTINCT)
- Ability to import and export reports, dashboards and layers from/to different
  Urungi instances
- Ability to duplicate reports and dashboards
- Ability to import (clone) an existing report into a dashboard
- Ability to set the number of results returned in report editor
- Ability to edit SQL queries in layer
- Ability to use aggregate functions in report filters
- Ability to add all columns of a collection to a layer in one click
- Ability to fold collections in layer editor
- Ability to sort and filter lists of reports, dashboards and layers
- Ability to choose chart legend position between top, right, bottom or hidden
- Ability to remove the background image from a dashboard element
- Ability to create custom elements in layer
- Ability to preview only a subset of results
- Ability to delete layers
- Ability to configure report height
- Sorting rule for C3.js tooltip labels
- Display query execution time in report editor
- Localization of all strings, french translation and language selector
- New "About" page
- New scripts for the first-time setup and changing a user's password
- Enforce JS style with ESLint and EditorConfig
- Enforce CSS style with stylelint
- Enforce HTML style with htmlhint
- Unit tests for server-side and client-side code
- Automated tests with Travis CI
- This changelog

### Changed

- **BREAKING**: MongoDB 3.4 or greater is required
- **BREAKING**: Node.js 8.x or greater is required
- Application name (Widestage -> Urungi)
- New skin, new logo
- Disable automatic refresh in report builder
- Show the "View SQL" button on page load in report edition page
- Move reports type selection buttons to the top of the page
- Use knex to build SQL queries and query SQL databases
- Repaint reports when a report is dropped on dashboard
- Add package-lock.json to git
- Use config package to manage configuration files
- Use debug package for debug messages
- Upgrade angular-sanitize and angular-route to match angular version
- Upgrade angular-ui-tree
- Replace angular-editable-text by angular-xeditable
- Update FontAwesome to 4.7.0
- Replace bower by npm + gulp to manage client dependencies
- Update email-templates to latest version
- Update jquery and jquery-validation to latest version
- Update moment to latest version
- Update async to latest version

### Removed

- **BREAKING**: Support for MongoDB data sources
- A lot of dead code
- A lot of unused dependencies
- Client-side session storage
- Encryption of AJAX requests

### Fixed

- A lot of minor issues

[Unreleased]: https://github.com/biblibre/urungi/compare/v2.2.0...HEAD
[2.2.0]: https://github.com/biblibre/urungi/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/biblibre/urungi/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/biblibre/urungi/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/biblibre/urungi/compare/v1.2.2...v2.0.0
[1.2.2]: https://github.com/biblibre/urungi/compare/v1.2.1...v1.2.2
[1.2.1]: https://github.com/biblibre/urungi/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/biblibre/urungi/compare/v1.1.1...v1.2.0
[1.1.1]: https://github.com/biblibre/urungi/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/biblibre/urungi/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/biblibre/urungi/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/biblibre/urungi/compare/widestage...v1.0.0
