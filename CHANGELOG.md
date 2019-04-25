# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

These are the most notable changes made since the fork of
[Widestage](https://github.com/widestage/widestage).

### Added

- package-lock.json
- Use config package to manage configuration files
- Use debug package for debug messages
- Enforce JS style with ESLint and EditorConfig
- Enforce CSS style with stylelint
- Enforce HTML style with htmlhint
- Unit tests for server-side and client-side code
- Automated tests with Travis CI
- Display query execution time in report editor
- Ability to set the number of results returned in report editor
- Ability to duplicate reports and dashboards
- New report type: pivot table
- New chart type: stacking bars
- Ability to edit layer queries
- Ability to use aggregate functions in report filters
- Ability to add columns of a collection to a layer in one click
- Localization of all strings, french translation and a language selector
- "About" page
- Ability to fold collections in layers
- Ability to sort and filter lists of reports, dashboards and layers
- Ability to import and export reports, dashboards and layers from/to different
  Urungi instances
- Ability to import (clone) an existing report into a dashboard
- Ability to choose legend position between top, right, bottom or hidden
- Ability to remove the background image from a dashboard element
- Ability to create custom elements in layer
- Script for the first-time setup
- Script for changing a user's password
- Ability to preview only a subset of results
- Ability to delete layers
- Sorting rule for C3.js tooltip labels
- Ability to configure report height
- New column aggregation COUNT(DISTINCT)
- This changelog

### Changed

- Application name (Widestage -> Urungi)
- New skin, new logo
- Show the "View SQL" button on page load in report edition page
- Disable automatic refresh in report builder
- Move reports type selection buttons to the top of the page
- Use knex to query SQL databases
- Repaint reports when a report is dropped on dashboard
- Upgrade angular-sanitize and angular-route to match angular version
- Upgrade angular-ui-tree
- Replace angular-editable-text by angular-xeditable
- Require at least version 8.x of nodejs
- Update FontAwesome to 4.7.0
- Replace bower by npm + gulp to manage client dependencies
- Require MongoDB version 3.4 or greater
- Update email-templates to latest version
- Update jquery and jquery-validation to latest version
- Update moment to latest version
- Update async to latest version

### Removed

- A lot of dead code
- A lot of unused dependencies
- Client-side session storage
- Support for MongoDB data sources
- Encryption of AJAX requests

### Fixed

- A lot of minor issues

[Unreleased]: https://github.com/biblibre/urungi/compare/widestage...HEAD
