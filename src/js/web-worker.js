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

        slice = null,

        key = null;

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

    WebWorker.prototype._isTerminateInitialized = false;


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
            } catch (err) {
                // Cannot be resolved as a selector
            }

            if ($scriptElement !== null && $scriptElement.length > 0) {
                // Matching script element found
                // Cache its contents
                scriptContents = $scriptElement.text();
                this._workerScript = scriptContents;
            } else {
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
        var self = this,
            workerUrl = null,
            onScriptLoaded = null;

        // Trigger event
        self.trigger(Event.WORKER_LOADING);

        workerUrl = self.getUrl() || null;
        onScriptLoaded = function () {
            var blob = null,
                scriptContents = null;

            scriptContents = self._workerScript;
            scriptContents = WebWorker.snippet.replace(/\{\{main-function\}\}/g, scriptContents);

            blob = new window.Blob([scriptContents], {
                "type": "text/javascript"
            });
            self._workerBlobUrl = window.URL.createObjectURL(blob);

            self._createWorker();

            return;
        };

        if (workerUrl === null) {
            // Script already available
            onScriptLoaded();
        } else {
            // Ajax request
            $.ajax({
                "async": true,
                "url": workerUrl,
                "dataType": 'text',
                "crossDomain": true,
                "success": function (responseText) {
                    self._workerScript = responseText;
                    onScriptLoaded();
                    return;
                },
                "error": function () {
                    self.throwError(Error.WORKER_DID_NOT_LOAD, arguments);
                    return;
                }
            });
        }

        return self;
    };

    WebWorker.prototype._createWorker = function () {
        var self = this;

        self._nativeWorker = new NativeWorker(self.getBlobUrl());

        self._attachMessageParser();

        return self;
    };

    WebWorker.prototype._assignEventHandlers = function () {
        var self = this;

        self.on(Event.ERROR, function () {
            console.log('error');
            console.log(arguments);
            return;
        });

        self.on(Event.WORKER_LOADED, function () {
            self._hasLoaded = true;
            return;
        });

        self.on(Event.TERMINATE, function () {
            self._isTerminateInitialized = true;
            return;
        });

        return self;
    };

    WebWorker.prototype.isTerminateInitialized = function () {
        return this._isTerminateInitialized;
    };

    WebWorker.prototype.start = function () {
        var self = this,
            args = null;

        if (!self.hasLoaded()) {
            return false;
        }

        self.trigger(Event.WORKER_STARTING);

        args = slice.call(arguments);
        self.sendMessage(Action.START, args);

        return self;
    };

    WebWorker.prototype.sendMessage = function (action, args) {
        var self = this,
            nativeWorker = null,
            message = null;

        action = action || null;
        args = args || null;

        if (action === null) {
            return false;
        }

        message = {
            "__isWebWorkerMsg": true
        };

        message.action = action;
        message.args = args;

        nativeWorker = self.getNativeWorker();

        if (nativeWorker !== null) {
            nativeWorker.postMessage(message);
        }

        return self;
    };

    WebWorker.prototype._attachMessageParser = function () {
        var self = this,
            nativeWorker = self.getNativeWorker();

        $(nativeWorker).on('message', function (event) {
            var originalEvent = event.originalEvent || event,
                msg = originalEvent.data,
                action = null,
                args = null;

            if (typeof msg === 'object'
                && '__isWebWorkerMsg' in msg
                && msg.__isWebWorkerMsg) {
                action = msg.action;
                args = msg.args;

                self[action].apply(self, args);
                return;
            }

            window.console.log('message');
            window.console.log(msg);

            return;
        });

        return self;
    };

    WebWorker.prototype.terminate = function () {
        var self = this,
            nativeWorker = self.getNativeWorker() || null;

        if (nativeWorker !== null) {
            self._isTerminateInitialized = true;
            self.trigger(Event.WORKER_TERMINATING);
            self.sendMessage(Action.SET_TERMINATING_STATUS, [true]);
            self.sendMessage(Action.TERMINATE, slice.call(arguments));
        }

        return;
    };

    WebWorker.prototype.terminateNow = function (returnValue) {
        var self = this,
            nativeWorker = null;

        if (!self.isTerminateInitialized()) {
            self.trigger(Event.WORKER_TERMINATING);
        }

        nativeWorker = self.getNativeWorker() || null;

        if (nativeWorker !== null) {
            nativeWorker.terminate();
            self._hasLoaded = false;
            self.trigger(Event.WORKER_TERMINATED, {"returnValue": returnValue});
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
        var self = this,
            $worker = self.$;

        $worker.off.apply($worker, arguments);
        self._assignEventHandlers();

        return this;
    };

    WebWorker.prototype.trigger = function (event) {
        var self = this,
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
            return self;
        }

        if (eventType in EventMap) {
            if (passedEventString) {
                event = new $.Event(eventType);
            }
            event.worker = self;
            eventArgs = [event];
            if (arguments.length > 1) {
                eventArgs = eventArgs.concat(slice.call(arguments, 1));
            }

            self._triggerSelf.apply(self, eventArgs);
            return self;
        }

        if (passedEventString) {
            event = {
                "type": eventType,
                "data": null
            };
        }
        eventArgs = [event];
        self.sendMessage(Action.TRIGGER_SELF, eventArgs);

        return self;
    };

    WebWorker.prototype.triggerSelf = function (event) {
        var self = this,
            eventType = null,
            eventArgs = null;

        if (typeof event === 'string') {
            eventType = event;
            event = new $.Event(eventType);
        }

        event.worker = self;
        eventArgs = [event];
        if (arguments.length > 1) {
            eventArgs = eventArgs.concat(slice.call(arguments, 1));
        }

        self._triggerSelf.apply(self, eventArgs);

        return;
    };

    WebWorker.prototype._triggerSelf = function () {
        var self = this,
            $worker = null;

        $worker = self.$;
        $worker.trigger.apply($worker, arguments);

        return;
    };


    WebWorker.prototype.throwError = function (error, data, throwException) {
        var self = this;

        error = error || Error.UNKNOWN;
        data = typeof data === 'undefined' ? null : data;
        throwException = throwException || false;

        self._lastError = error;
        WebWorker._lastError = error;

        if ('_triggerError' in self) {
            self._triggerError(error, data, throwException);
        }

        if (throwException) {
            throw new window.Error(error);
        }

        return;
    };

    WebWorker.prototype._triggerError = function (error, data, throwException) {
        var self = this,
            errorEvent = null;

        errorEvent = new $.Event(Event.ERROR);
        errorEvent.message = self.getLastError();
        errorEvent.data = data;
        errorEvent.throwsException = !!throwException;

        self.trigger(errorEvent);
        return;
    };

    WebWorker.prototype.getLastError = function () {
        return this._lastError;
    };


    // Static

    WebWorker._lastError = null;

    Action = {
        "START": 'start',
        "SET_TERMINATING_STATUS": 'setTerminatingStatus',
        "TERMINATE": 'terminate',
        "TERMINATE_NOW": 'terminateNow',
        "TRIGGER": 'trigger',
        "TRIGGER_SELF": 'triggerSelf'
    };
    WebWorker.Action = Action;

    Event = {
        "INITIALIZED": 'initialized',
        "ERROR": 'error',

        "WORKER_LOADING": 'worker-loading',
        "WORKER_LOADED": 'worker-loaded',

        "WORKER_STARTING": 'worker-starting',
        "WORKER_STARTED": 'worker-started',

        "WORKER_TERMINATING": 'worker-terminating',
        "WORKER_TERMINATED": 'worker-terminated'
    };
    WebWorker.Event = Event;

    EventMap = {};
    WebWorker.EventMap = EventMap;

    // Add eventPrefix to all event types
    for (key in Event) {
        Event[key] = eventPrefix + Event[key];
        EventMap[Event[key]] = key;
    }

    Error = {
        "UNKNOWN": "An unknown error occured.",
        "INVALID_ARGUMENTS": "Invalid arguments were supplied to this method.",
        "WORKER_DID_NOT_LOAD": "Unable to load worker."
    };
    WebWorker.Error = Error;

    WebWorker.throwError = WebWorker.prototype.throwError;

    WebWorker.snippet = '(function(){var Action=null,Event=null,Listeners=null;Action={{action-data}};Event={{event-data}};self.hasInitialized=false;Listeners={};self.Listeners=Listeners;self.isTerminating=false;' +
                        'self.terminateHandler=null;self.main=function(){ {{main-function}} };self.init=function(){self.hasInitialized=true;self.trigger(Event.WORKER_LOADED);return self};self.start=function(){if(!self.hasInitialized)return false;self.main.apply(self,arguments);self.trigger(Event.WORKER_STARTED);return self};self.on=function(eventType,listener){eventType+="";listener=listener||null;if(typeof listener!=="function")return self;if(!(eventType in Listeners))Listeners[eventType]=[];Listeners[eventType].push(listener);return self};' +
                        'self.one=function(eventType,listener){var wrapperListener=null;wrapperListener=function(){listener.apply(this,arguments);self.off(eventType,wrapperListener);return};self.on(eventType,wrapperListener);return};self.off=function(eventType,listener){var key=null;eventType=eventType||null;listener=listener||null;if(eventType===null&&listener===null){for(key in Listeners)delete Listeners[key];return self}for(key in Listeners)self._removeListenerFromEventType(key,listener);return self};self._removeListenerFromEventType=' +
                        'function(eventType,listener){var listeners=Listeners[eventType];listener=listener||null;if(listener===null){Listeners[eventType]=[];return self}for(var i=0;i<listeners.length;i++)if(listeners[i]===listener){listeners.splice(i,1);i--}return self};self.trigger=function(event,data){var eventType=null,hasData=null;hasData=typeof data!=="undefined";if(typeof event==="string"){eventType=event||null;if(hasData)event={type:eventType,data:data}}else if(typeof event==="object"){eventType=event.type||null;data=' +
                        'event.data}if(eventType===null)return self;self.sendMessage(Action.TRIGGER,[event]);return self};self.triggerSelf=function(event,data){var worker=this,eventType=null,listeners=null,listenersCount=null,listener=null;if(typeof event==="string")eventType=event||null;else if(typeof event==="object"){eventType=event.type||null;data=event.data}if(eventType===null)return self;event.data=data;listeners=Listeners[eventType]||null;if(listeners===null)return self;listenersCount=listeners.length;for(var i=0;i<' +
                        'listenersCount;i++){listener=listeners[i];listener.apply(worker,[event])}return self};self.sendMessage=function(action,args){var message=null;action=action||null;args=args||null;if(action===null)return false;message={__isWebWorkerMsg:true};message.action=action;message.args=args;self.postMessage(message);return self};self.terminate=function(){var terminateHandler=null,returnValue=null;terminateHandler=self.terminateHandler||null;if(!self.isTerminating){self.isTerminating=true;self.trigger(Event.WORKER_TERMINATING)}if(typeof terminateHandler===' +
                        '"function")returnValue=terminateHandler.apply(self,arguments);self.sendMessage(Action.TERMINATE_NOW,[returnValue]);return};self.setTerminatingStatus=function(status){self.isTerminating=status;return self};self.close=self.terminate;self.onmessage=function(event){var originalEvent=event.originalEvent||event,msg=originalEvent.data,action=null,args=null;if(typeof msg==="object"&&"__isWebWorkerMsg"in msg&&msg.__isWebWorkerMsg){action=msg.action;args=msg.args;self[action].apply(self,args);return}return};' +
                        'self.init();return})();';

    WebWorker.snippet = WebWorker.snippet.replace(/\{\{action-data\}\}/g, JSON.stringify(Action))
                                         .replace(/\{\{event-data\}\}/g, JSON.stringify(Event));

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
