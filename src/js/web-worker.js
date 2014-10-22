/*eslint no-native-reassign:0 */
(function ($) {
    'use strict';

    var WebWorker = null,
        BrowserWorker = null,

        context = null,
        className = null,

        defaultContext = window,
        defaultClassName = 'WebWorker',

        Event = null,
        eventPrefix = 'webworker:',

        Error = null;

    var windowConsole = window.console,
        console = null;

    console = {
        log: function (data, suppressNoise) {
            suppressNoise = suppressNoise || false;

            if (suppressNoise) {
                windowConsole.log(data);
            }
            else {
                windowConsole.log({
                    '>>>>>>>> internal': true,
                    'log': data
                });
            }

            return;
        },
        warn: windowConsole.warn,
        error: windowConsole.error
    };

    context = context || defaultContext;
    className = className || defaultClassName;

    WebWorker = context[className] || null;

    if (WebWorker !== null) {
        return;
    }

    BrowserWorker = window.Worker;

    WebWorker = function () {
        this._constructor.apply(this, arguments);
        return;
    };

    WebWorker.prototype.$ = null;

    WebWorker.prototype._workerUrl = null;
    WebWorker.prototype._workerBlobUrl = null;

    WebWorker.prototype._workerScript = null;

    WebWorker.prototype._worker = null;
    WebWorker.prototype._lastError = null;

    WebWorker.prototype._hasLoaded = false;


    WebWorker.prototype._constructor = function (opts) {
        var $scriptElement = null,
            scriptContents = null,
            workerUrl = null;

        this.$ = $(this);

        opts = opts || null;

        if (opts === null) {
            this.throwError(Error.INVALID_ARGUMENTS, null, true);
            return;
        }

        if (typeof opts === 'string') {
            opts = $.trim(opts);

            try {
                $scriptElement = $(opts);
            }
            catch (err) {
                // Cannot be resolved as a selector
            }

            if ($scriptElement !== null && $scriptElement.length > 0) {
                // Matching script element found
                // Cache its contents
                scriptContents = $scriptElement.text();
                this._workerScript = scriptContents;
            }
            else {
                workerUrl = opts;
            }
        }

        this._workerUrl = workerUrl;

        this._assignEventHandlers();

        this.trigger(Event.INITIALIZED);

        return;
    };

    WebWorker.prototype.getUrl = function () {
        return this._workerUrl;
    };

    WebWorker.prototype.getBlobUrl = function () {
        return this._workerBlobUrl;
    };

    WebWorker.prototype.hasLoaded = function () {
        return this._hasLoaded;
    };

    WebWorker.prototype.load = function () {
        var worker = this,
            workerUrl = null,
            onScriptLoaded = null;

        // Trigger event
        worker.trigger(Event.WORKER_LOADING);

        workerUrl = worker.getUrl() || null;
        onScriptLoaded = function () {
            var blob = null,
                scriptContents = null;

            scriptContents = worker._workerScript;
            blob = new window.Blob([scriptContents], {
                type: "text/javascript"
            });
            worker._workerBlobUrl = window.URL.createObjectURL(blob);

            worker._createWorker();

            return;
        };

        if (workerUrl === null) {
            // Script already available
            onScriptLoaded();
        }
        else {
            // Ajax request
            $.ajax({
                async: true,
                url: workerUrl,
                dataType: 'text',
                crossDomain: true,
                success: function (responseText) {
                    worker._workerScript = responseText;
                    onScriptLoaded();
                    return;
                },
                error: function () {
                    worker.throwError(Error.WORKER_DID_NOT_LOAD, arguments);
                    return;
                }
            });
        }

        return worker;
    };

    WebWorker.prototype._createWorker = function () {
        var worker = this;

        worker._worker = new BrowserWorker(worker._workerUrl);

        // TODO: Cleanup
        $(worker._worker).on('message', function (event) {
            console.log(event, true);
            var actionMessage = event.originalEvent.data;

            if ((typeof actionMessage === 'object')
                && ('action' in actionMessage)
                && actionMessage.action === 'trigger') {
                worker.trigger.apply(worker, actionMessage.data.args);
                return;
            }

            worker.trigger.apply(worker, [event]);
            return;
        });

        worker._initializeWorker();
        return;
    };

    WebWorker.prototype._assignEventHandlers = function () {
        var worker = this;

        worker.on(Event.ERROR, function () {
            console.log('error');
            console.log(arguments);
            return;
        });

        worker.on(Event.WORKER_LOADED, function () {
            worker._hasLoaded = true;
            return;
        });

        return worker;
    };

    WebWorker.prototype.start = function () {
        console.log('pending >> start the worker');
        var worker = this;

        worker.trigger(Event.WORKER_STARTING);

        return worker;
    };

    WebWorker.prototype._initializeWorker = function () {
        this._worker.postMessage({
            action: 'init',
            data: {
                args: []
            }
        });

        return;
    };

    WebWorker.prototype.terminate = function () {
        var worker = this,
            nativeWorker = worker._worker || null;

        if (nativeWorker !== null) {
            nativeWorker.terminate();
            worker._hasLoaded = false;
            worker.trigger(Event.WORKER_TERMINATED);
        }

        return;
    };

    WebWorker.prototype.on = function () {
        var $worker = this.$;
        $worker.on.apply($worker, arguments);
        return this;
    };

    WebWorker.prototype.one = function () {
        var $worker = this.$;
        $worker.one.apply($worker, arguments);
        return this;
    };

    WebWorker.prototype.off = function () {
        var worker = this,
            $worker = worker.$;

        $worker.off.apply($worker, arguments);
        worker._assignEventHandlers();

        return this;
    };

    WebWorker.prototype.trigger = function (event) {
        var worker = this,
            $worker = null,
            eventType = null,
            eventArgs = null;

        if (typeof event === 'string') {
            eventType = event;
            event = new $.Event(eventType);
        }

        event.worker = worker;
        eventArgs = [event];
        if (arguments.length > 1) {
            eventArgs = eventArgs.concat(Array.slice(arguments, 1));
        }

        $worker = worker.$;
        $worker.trigger.apply($worker, eventArgs);

        return this;
    };


    WebWorker.prototype.throwError = function (error, data, throwException) {
        var worker = this;

        error = error || Error.UNKNOWN;
        data = (typeof data === 'undefined') ? null : data;
        throwException = throwException || false;

        worker._lastError = error;
        WebWorker._lastError = error;

        if ('_triggerError' in worker) {
            worker._triggerError(error, data, throwException);
        }

        if (throwException) {
            throw new window.Error(error);
        }

        return;
    };

    WebWorker.prototype._triggerError = function (error, data, throwException) {
        var worker = this,
            errorEvent = null;

        errorEvent = new $.Event(Event.ERROR);
        errorEvent.message = worker.getLastError();
        errorEvent.data = data;
        errorEvent.throwsException = (!!throwException);

        worker.trigger(errorEvent);
        return;
    };

    WebWorker.prototype.getLastError = function () {
        return this._lastError;
    };


    // Static

    WebWorker._lastError = null;

    Event = {
        INITIALIZED: 'initialized',
        ERROR: 'error',

        WORKER_LOADING: 'worker-loading',
        WORKER_LOADED: 'worker-loaded',

        WORKER_STARTING: 'worker-starting',
        WORKER_STARTED: 'worker-started',

        WORKER_TERMINATED: 'worker-terminated'
    };
    WebWorker.Event = Event;

    // Add eventPrefix to all event types
    for (var key in Event) {
        Event[key] = eventPrefix + Event[key];
    }

    Error = {
        UNKNOWN: "An unknown error occured.",
        INVALID_ARGUMENTS: "Invalid arguments were supplied to this method.",
        WORKER_DID_NOT_LOAD: "Unable to load worker."
    };
    WebWorker.Error = Error;

    WebWorker.throwError = WebWorker.prototype.throwError;

    // TODO: Make this method more manageable and consistent with the way jQuery handles things.
    WebWorker.noConflict = function (context, className) {
        context = context || defaultContext;
        className = className || defaultClassName;

        context[className] = WebWorker;

        return WebWorker;
    };

    WebWorker.noConflict(context, className);

    return;
})(jQuery);
