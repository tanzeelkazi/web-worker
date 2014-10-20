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

    var console = {
        log: function (data, suppressNoise) {
            var console = window.console;

            suppressNoise = suppressNoise || false;

            if (suppressNoise) {
                console.log(data);
            }
            else {
                console.log({
                    '>>>>>>>> internal': true,
                    'log': data
                });
            }
            
            return;
        },
        warn: window.console.warn,
        error: window.console.error
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
    WebWorker.prototype._worker = null;
    WebWorker.prototype._lastError = null;

    WebWorker.prototype._constructor = function (opts) {
        var $scriptElement = null,
            scriptContents = null,
            blob = null,
            workerUrl = null;

        this.$ = $(this);

        opts = opts || null;

        if (opts === null) {
            this.throwError(Error.INVALID_ARGUMENTS);
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
                // Create a blob URL with its contents
                scriptContents = $scriptElement.text();
                blob = new Blob([scriptContents], { type: "text/javascript" });
                workerUrl = window.URL.createObjectURL(blob);
            }
            else {
                //this.throwError(Error.UNKNOWN);
                workerUrl = opts;
            }
        }

        
        this._workerUrl = workerUrl;
        this._createWorker();
        
        this.on(Event.INITIALIZED, function () {
            console.log('Initialize event triggered', true);
            return;
        });

        this._triggerEvent(Event.INITIALIZED);

        return;
    };

    WebWorker.prototype.getUrl = function () {
        return this._workerUrl;
    };

    WebWorker.prototype._createWorker = function () {
        var worker = this;

        worker._worker = new BrowserWorker(worker._workerUrl);

        worker.on(Event.WORKER_LOADED, function () {
            console.log('worker has loaded');
            return;
        });

        worker.on('message', function () {
            var args = arguments;
            console.log(args);
            if (typeof args[0] === 'object') {
                console.log(args[0].thobda, true);
                console.log(args[0].thobda.method, true);
            }
            return;
        });

        $(worker._worker).on('message', function (event) {
            console.log(event, true);
            var actionMessage = event.originalEvent.data;
            
            console.log(actionMessage, true);
            if ((typeof actionMessage === 'object') && ('action' in actionMessage) && actionMessage.action === 'trigger') {
                worker._triggerEvent.apply(worker, actionMessage.data.args);
                return;
            }
            
            worker.trigger.apply(worker, [event]);
            return;
        });

        worker._assignEventHandlers();
        worker._initializeWorker();
        return;
    };

    WebWorker.prototype._assignEventHandlers = function () {
        //console.log('pending');
        return;
    };

    WebWorker.prototype._initializeWorker = function () {
        this._worker.postMessage({
            action: 'init',
            data: {
                args: [
                    
                ]
            }
        });

        return;
    };

    WebWorker.prototype.terminate = function () {
        this._worker.terminate();
        return;
    };

    WebWorker.prototype._triggerEvent = function (eventType, data, extendedProps) {
        var argsLength = arguments.length,
            event = null;

        eventType = eventType || null;
        data = data || null;
        extendedProps = extendedProps || null;

        if (argsLength === 1 && (typeof eventType === 'object')) {
            event = eventType;
            eventType = event.type;
        }

        if (eventType === null) {
            return;
        }
        
        if (event === null) {
            event = $.Event(eventType, extendedProps);
        }

        event.data = data;

        this.trigger(event);
        return;
    };

    WebWorker.prototype.on = function () {
        var $worker = this.$;
        $worker.on.apply($worker, arguments);
        return this;
    };

    WebWorker.prototype.once = function () {
        var $worker = this.$;
        $worker.once.apply($worker, arguments);
        return this;
    };

    WebWorker.prototype.off = function () {
        var $worker = this.$;
        $worker.off.apply($worker, arguments);
        return this;
    };

    WebWorker.prototype.trigger = function () {
        var $worker = this.$;
        $worker.trigger.apply($worker, arguments);
        return this;
    };


    WebWorker.prototype.throwError = function (error) {
        this._lastError = error;
        WebWorker._lastError = error;
        throw new Error(error);
        return;
    };

    WebWorker.prototype.getLastError = function () {
        return this._lastError;
    };


    // Static

    WebWorker._lastError = null;

    Event = {
        INITIALIZED: 'init',

        WORKER_LOADED: 'worker-loaded'
    };
    WebWorker.Event = Event;

    // Add eventPrefix to all event types
    for (var key in Event) {
        Event[key] = eventPrefix + Event[key];
    }

    Error = {
        UNKNOWN: "An unknown error occured.",
        INVALID_ARGUMENTS: "Invalid arguments were supplied to this method. Please check the documentation on the supported arguments for this method."
    };
    WebWorker.Error = Error;

    WebWorker.throwError = WebWorker.prototype.throwError;

    WebWorker.noConflict = function (context, className) {
        context = context || defaultContext;
        className = className || defaultClassName;

        context[className] = WebWorker;

        return WebWorker;
    };

    WebWorker.noConflict(context, className);

    return;
})(jQuery);