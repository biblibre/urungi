# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/biblibre/urungi/compare/widestage...HEAD
