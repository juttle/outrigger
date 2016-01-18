# Change Log
This file documents all notable changes to outrigger. The release numbering uses [semantic versioning](http://semver.org).

## Unreleased Changes
### Major Changes

### Minor Changes
- Rearrange all example programs so they can be run from a single set of [docker-compose](https://docs.docker.com/compose/) files.
- Embed all example juttle programs in the base outrigger docker image so they can be run without having to git clone the outrigger repository first.
- Minor changes to Travis-CI configuration to reflect the changes in [#48].
- Add unit tests for browser/outriggerd interactions [#12].
- Expose the `juttle` CLI in the `bin` directory of the outrigger installation.

### Bug Fixes
- Prevent a race condition where a short-lived program could start, run, and stop before the browser could open a websocket to receive the program's output. [#64]

## 0.3.0
Released 2016-01-13

### Major Changes
- Add support for running example programs using docker. An ``outrigger`` container is now available on docker hub.
- Add support for editor-driven/remote outrigger program management. Instead of specifying files directly via ``run?path=<path>``, the browser can load a page ``run?rendezvous=<session>``. ``outrigger-client``'s ``push`` and ``watch`` commands push programs to the browser for a given session. This allows for running a client/editor on a different host than the host running outrigger. [#13]
- The browser app served by outrigger now uses a standalone [javascript library](http://github.com/juttle/juttle-client-library) which implements the client half of the [JSDP](./docs/jsdp-api.md) and [Jobs](./docs/jobs-api.md) APIs supported by outrigger.
- Outrigger now explicitly depends on a specific version of juttle and specific versions of all juttle adapters. Subsequent releases will move the dependent versions forward as necessary. [#48]

### Minor Changes
- New command line options ``-l/--log-level``, ``-L/--log-config``, and ``-o/--output`` allow specifying an alternate location for log4js config, or simply changing the log level and/or location. [#45]
- New command line options ``-c/--config`` allows specifing an explicit path to a juttle config file [#46]
- New command line option ``-d/--daemonize`` enables explicit backgrounding.
- Add additional demo programs that show various capabilities of juttle.
- Add code coverage tests. [#42]

### Bug Fixes
- Make sure a custom path for --config was being passed all the way to the subprocess that runs a juttle program [#62]

## 0.2.2
Released 2016-01-07

### Major Changes

### Minor Changes

### Bug Fixes
- Ensure that the browser websocket connection can reach an outrigger other than ``localhost``.

## 0.2.1
Released 2016-01-07

### Major Changes

### Minor Changes
- Add demo programs that show various capabilities of juttle.

### Bug Fixes
- Fix running in production mode when globally installed [#39]

## 0.2.0
Released 2016-01-06

### Major Changes
- Update to support new features in [juttle](http://github.com/juttle/juttle) 0.2.0.
- Update to support new features in [juttle-viz](http://github.com/juttle/juttle-viz) 0.2.0.
- Added initial version of Docker image that packages outrigger and dependent modules.
- Make jobs api and app server accessible from a single port.

### Minor Changes
- Add CORS support.

### Bug Fixes
- Allow API calls to reach an outrigger other than ``localhost``.
- Minor docs changes to fix links for npm-hosted README.md files.

## 0.1.3
Released 2015-12-19

### Major Changes

### Minor Changes

### Bug Fixes
- Ensure that outrigger can be run when pulled from npm in addition to a source tree [#4].

## 0.1.1
Released 2015-12-18

### Major Changes
- Initial Version.

### Minor Changes

### Bug Fixes

