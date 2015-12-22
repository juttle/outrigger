# Outrigger

[![Build Status](https://travis-ci.org/juttle/outrigger.svg)](https://travis-ci.org/juttle/outrigger)

Outrigger is a [juttle](https://github.com/juttle/juttle) development environment that allows you develop, run, and view the output of Juttle programs in a browser.  You use your editor of choice to edit juttles on your
filesystem and run them in a browser from the filesystem using Outrigger.

Because most views in Juttle are data visualizations, they cannot
be rendered in the Juttle CLI.  Outrigger bridges this gap
with a javascript charting library that receives streaming data
from Juttle programs running server-side via a websocket.  It also includes
user-interface logic to implement Juttle input controls.

If you simply want to try running some basic juttle programs that output directly to the terminal, you can use the ``juttle`` command line program included in the Juttle respository.

## Getting Started

### Installation

Make sure you have [node](http://nodejs.org) (with [npm](http://npmjs.org)) installed.

Use npm to install outrigger
```
$ npm install -g juttle
$ npm install -g outrigger
```

We've tested with nodejs 4.2.3 and npm 2.14.17. Other combinations of nodejs and npm likely work, but we haven't tested all combinations.

### Running your first juttle program

Start the daemon by running outriggerd:
```
$ outriggerd &
```
You can now run juttle programs against the outriggerd daemon via the outrigger-client:
```
$ outrigger-client browser --path my_juttle_file.juttle
```
This will open a browser window and display the output of the program. You can make edits to your juttle, save the file, and reload the browser window to get the updated output.

## Options and Configuration

Here are the full command line options supported by the daemon and client programs:

### outriggerd

```
usage: [--port <port>] [--root <path>]
       --port <port>: Run outriggerd on specified port.
       --root <path>: Use <path> as the root directory for juttle programs.
```

``outriggerd`` uses log4js for logging and by default logs to ``log/outrigger.log``.

### outrigger-client

```
usage: [--outriggerd <hostname:port>] [--help] [COMMAND] [OPTIONS]
   [COMMAND]: one of the following, with the following options:
         list_jobs [--job <job-id>]
         browser --path <path>
   [OPTIONS]: one of the following:
       --path <path-to-juttle-file>:          Path to file relative to configured root directory.
                                              Used by "browser".
       --job <job-id>:                        Job id.
                                              Used by "list_jobs".
       --outriggerd <hostname:port>:          Hostname/port of outrigger juttle server
       --help:                                Print this help and exit
```

### Juttle config file

The Juttle compiler and runtime within outriggerd are also configured via the juttle configuration file, typically at ``$(HOME)/.juttle/config.json``. For more information on the juttle configuration file, see the [juttle configuration documentation](https://github.com/juttle/juttle/blob/master/docs/reference/cli.md#configuration).

### Module resolution

When outriggerd resolves module references in juttle programs while creating program bundles, it searches the following locations:
* The configured root directory.
* The same location as the current juttle program. For example, if a program is at ``/home/user/program.juttle`` and refers to a module ``module.juttle``, outriggerd looks in ``/home/user`` for ``module.juttle``.
* Any locations in the environment variable JUTTLE_MODULE_PATH (colon-separated list of directories).

## Architecture

Curious about how outrigger works? Check out the [architecture page](./docs/ARCHITECTURE.md).

## Testing

To run unit tests:

``gulp test``

To check code style and perform lint checks:

``gulp lint``

Both are run automatically by Travis.
