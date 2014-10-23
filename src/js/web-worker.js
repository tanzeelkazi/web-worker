/*eslint no-native-reassign:0 */
(function ($) {
    'use strict';

    var WebWorker = null,
        NativeWorker = null,

        context = null,
        className = null,

        defaultContext = window,
        defaultClassName = 'WebWorker',

        Action = null,

        Event = null,
        eventPrefix = 'webworker:',

        EventMap = null,

        Error = null,

        slice = null;

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

    slice = Array.prototype.slice;
    NativeWorker = window.Worker;

    WebWorker = function () {
        this._constructor.apply(this, arguments);
        return;
    };

    WebWorker.prototype.$ = null;

    WebWorker.prototype._workerUrl = null;
    WebWorker.prototype._workerBlobUrl = null;

    WebWorker.prototype._workerScript = null;

    WebWorker.prototype._nativeWorker = null;
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

    WebWorker.prototype.getNativeWorker = function () {
        return this._nativeWorker;
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

        worker._nativeWorker = new NativeWorker(worker.getUrl());

        // TODO: Cleanup
        $(worker.getNativeWorker()).on('message', function (event) {
            console.log('onmessage');
            console.log(event, true);

            var originalEvent = event.originalEvent || event,
                msg = originalEvent.data,
                action = null,
                args = null;

            if ((typeof msg === 'object')
                && ('__isWebWorkerMsg' in msg)
                && (msg.__isWebWorkerMsg)) {
                action = msg.action;
                args = msg.args;

                worker[action].apply(worker, args);
                return;
            }

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
        var worker = this,
            args = null;

        if (!worker.hasLoaded()) {
            return false;
        }

        worker.trigger(Event.WORKER_STARTING);

        args = slice.call(arguments);
        worker.sendMessage(Action.START, args);

        return worker;
    };

    WebWorker.prototype.sendMessage = function (action, args) {
        var worker = this,
            nativeWorker = null,
            message = null;

        action = action || null;
        args = args || null;

        if (action === null) {
            return false;
        }

        message = {
            __isWebWorkerMsg: true
        };

        message.action = action;
        message.args = args;

        nativeWorker = worker.getNativeWorker();

        if (nativeWorker !== null) {
            nativeWorker.postMessage(message);
        }

        return worker;
    };

    WebWorker.prototype._initializeWorker = function () {
        var worker = this;
        //worker.sendMessage(Action.INIT);
        return worker;
    };

    WebWorker.prototype.terminate = function () {
        var worker = this,
            nativeWorker = worker.getNativeWorker() || null;

        if (nativeWorker !== null) {
            worker.trigger(Event.WORKER_TERMINATING);
            worker.sendMessage(Action.TERMINATE, arguments);
        }

        return;
    };

    WebWorker.prototype.terminateNow = function (returnValue) {
        var worker = this,
            nativeWorker = null;

        nativeWorker = worker.getNativeWorker() || null;

        if (nativeWorker !== null) {
            nativeWorker.terminate();
            worker._hasLoaded = false;
            worker.trigger(Event.WORKER_TERMINATED, {returnValue: returnValue});
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
            passedEventString = false,
            eventType = null,
            eventArgs = null;

        if (typeof event === 'object') {
            eventType = event.type || null;
        }

        if (typeof event === 'string') {
            eventType = event || null;
            passedEventString = true;
        }

        if (eventType === null) {
            return worker;
        }

        if (eventType in EventMap) {
            if (passedEventString) {
                event = new $.Event(eventType);
            }
            event.worker = worker;
            eventArgs = [event];
            if (arguments.length > 1) {
                eventArgs = eventArgs.concat(slice.call(arguments, 1));
            }

            worker._triggerSelf.apply(worker, eventArgs);
            return worker;
        }

        if (passedEventString) {
            event = {
                type: eventType,
                data: null
            };
        }
        eventArgs = [event];
        worker.sendMessage(Action.TRIGGER_SELF, eventArgs);

        return worker;
    };

    WebWorker.prototype.triggerSelf = function (event) {
        var worker = this,
            eventType = null,
            eventArgs = null;

        if (typeof event === 'string') {
            eventType = event;
            event = new $.Event(eventType);
        }

        event.worker = worker;
        eventArgs = [event];
        if (arguments.length > 1) {
            eventArgs = eventArgs.concat(slice.call(arguments, 1));
        }

        worker._triggerSelf.apply(worker, eventArgs);

        return;
    };

    WebWorker.prototype._triggerSelf = function () {
        var worker = this,
            $worker = null;

        $worker = worker.$;
        $worker.trigger.apply($worker, arguments);

        return;
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

    Action = {
        INIT: 'init',
        START: 'start',
        TERMINATE: 'terminate',
        TERMINATE_NOW: 'terminateNow',
        TRIGGER: 'trigger',
        TRIGGER_SELF: 'triggerSelf'
    };
    WebWorker.Action = Action;

    Event = {
        INITIALIZED: 'initialized',
        ERROR: 'error',

        WORKER_LOADING: 'worker-loading',
        WORKER_LOADED: 'worker-loaded',

        WORKER_STARTING: 'worker-starting',
        WORKER_STARTED: 'worker-started',

        WORKER_TERMINATING: 'worker-terminating',
        WORKER_TERMINATED: 'worker-terminated'
    };
    WebWorker.Event = Event;

    EventMap = {};
    // Add eventPrefix to all event types
    for (var key in Event) {
        Event[key] = eventPrefix + Event[key];
        EventMap[Event[key]] = key;
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
