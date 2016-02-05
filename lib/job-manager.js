var _ = require('underscore');
var Base = require('extendable-base');
var uuid = require('uuid');
var logger = require('log4js').getLogger('job-manager');
var events = require('backbone').Events;
var WebsocketJuttleJob = require('./ws-juttle-job');
var ImmediateJuttleJob = require('./immediate-juttle-job');

// This class handles management of jobs (running juttle programs). It
// also brings together websocket endpoints and the outputs (sinks) of
// running juttle programs.

var JobManager = Base.extend({

    initialize: function(options) {
        var self = this;

        self._config_path = options.config_path;

        // job_id -> JuttleJob
        self._jobs = {};

        self._max_saved_messages = options.max_saved_messages;
        self._delayed_job_cleanup = options.delayed_job_cleanup;

        // This object emits job_start/job_end events when jobs are
        // started and deleted.
        self.events = _.extend({}, events);
    },

    // Returns an array of job objects for all active jobs.
    get_all_jobs: function() {
        var self = this;

        return _.values(self._jobs);
    },

    // Return the job object associated with the given job id, or
    // undefined if no job exists for that job id.

    get_job: function(job_id) {
        var self = this;

        if (! _.has(self._jobs, job_id)) {
            return undefined;
        } else {
            return self._jobs[job_id];
        }
    },

    delete_job: function(job_id) {
        var self = this;

        if (_.has(self._jobs, job_id)) {
            logger.debug('Removing job ' + job_id + ' from jobs hash');

            self._jobs[job_id].stop();

            // Remove the job from the jobs hash now, so list_jobs
            // will not find the job.
            self._jobs = _.omit(self._jobs, job_id);

            return job_id;
        } else {
            return undefined;
        }
    },

    run_program: function(options) {
        var self = this;

        options.inputs = options.inputs || {};
        if (!_.has(options, 'wait')) {
            options.wait = false;
        }

        logger.debug('Running program "' + options.bundle.program.slice(0, 20) + '..." with observer ' + options.observer_id);

        // If wait is true, create an ImmediateJuttleJob for the job
        // and the promise we return will resolve only when the
        // program is complete. Otheriwse, create a WebsocketJuttleJob
        // and the promise we return will resolve when the program has
        // started.

        var job_id = uuid.v4();

        var job;

        var job_options = {job_id: job_id,
                           bundle: options.bundle,
                           inputs: options.inputs,
                           config_path: self._config_path};

        if (options.wait) {
            _.extend(job_options, {
                timeout: options.timeout
            });
            job = new ImmediateJuttleJob(job_options);
        } else {
            _.extend(job_options, {
                endpoints: [],
                max_saved_messages: self._max_saved_messages
            });
            job = new WebsocketJuttleJob(job_options);
        }

        self._jobs[job_id] = job;

        job.events.on('end', function() {

            self.events.trigger('job_end', job_id, options.observer_id);

            // The job is complete. Remove it from the jobs hash. In
            // order to give time for very late job subscribers to
            // connect and receive the output of very short programs,
            // we actually remove the job from the hash after a short
            // timeout.
            // If the timeout is 0, we remove the job immediately.
            if (self._delayed_job_cleanup === 0) {
                self.delete_job(job_id);
            } else {
                setTimeout(function() {
                    self.delete_job(job_id);
                }, self._delayed_job_cleanup);
            }
        });

        self.events.trigger('job_start', job_id, options.observer_id);

        // Return a promise from job.start(). For ImmediateJuttleJob,
        // the promise resolves only when the program is complete with
        // the output of the program and pid. For WebsocketJuttleJob,
        // it resolves as soon as the program has started with the job
        // id and pid.
        return job.start();
    }
});

module.exports = JobManager;
