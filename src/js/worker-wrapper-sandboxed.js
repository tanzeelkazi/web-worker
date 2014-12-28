var WorkerWrapperSandbox = {},
    noop = null,
    self = null;

self = self || WorkerWrapperSandbox;

noop = function() {
    return function () {};
};

WorkerWrapperSandbox.postMessage = noop();

WorkerWrapperSandbox.close = noop();

WorkerWrapperSandbox.onmessage = null;

WorkerWrapperSandbox.addEventListener = function (event, listener) {
    this.onmessage = listener;
    return;
};

WorkerWrapperSandbox.loadWorker = function () {

    /**
     * @module WebWorker
     */
    var State = null,
        Action = null,
        Event = null,
        _listeners = {};

    State = {
        "INITIALIZED": 0,
        "LOADING": 1,
        "LOADED": 2,
        "STARTING": 3,
        "STARTED": 4,
        "TERMINATING": 5,
        "TERMINATED": 6
    };

    Action = {
        "LOG": 'log',
        "START": 'start',
        "TERMINATE": 'terminate',
        "TERMINATE_NOW": 'terminateNow',
        "TRIGGER": 'trigger',
        "TRIGGER_SELF": 'triggerSelf'
    };

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

    // Add eventPrefix to all event types
    for (var key in Event) {
        Event[key] = 'webworker:' + Event[key];
    }

    /**
     * This documentation is for the worker script _wrapper_. Every user webworker
     * script is wrapped within this shell. All properties and methods described
     * here are attached to the `'self'` object within the worker script.
     * @class Wrapper
     * @static
     */

    /**
     * Object in which all internal worker listeners are tracked.
     * @property _listeners
     * @type {Object}
     * @private
     */
    self._listeners = _listeners;

    /**
     * Boolean indicating if the worker script has been initiated to be terminated.
     * @property _isTerminating
     * @type {Boolean}
     * @private
     * @default false
     */
    self._isTerminating = false;

    /**
     * The current state of the worker. This value is updated internally by the worker.
     * Valid values for this property are defined in {{#crossLink "WebWorker/State:property"}}{{/crossLink}}.
     * @property _state
     * @type {Number}
     * @private
     * @default null
     */
    self._state = null;

    /**
     * List of pre-defined actions for the worker. This value is inherited from the
     * base class. Refer to {{#crossLink "WebWorker/State:property"}}{{/crossLink}}
     * for more information.
     * @property State
     * @type {Object}
     */
    self.State = State;

    /**
     * List of pre-defined actions for the worker. This value is inherited from the
     * base class. Refer to {{#crossLink "WebWorker/Action:property"}}{{/crossLink}}
     * for more information.
     * @property Action
     * @type {Object}
     */
    self.Action = Action;

    /**
     * List of pre-defined event types for the worker. This value is inherited from the
     * base class. Refer to {{#crossLink "WebWorker/Event:property"}}{{/crossLink}}
     * for more information.
     * @property Event
     * @type {Object}
     */
    self.Event = Event;

    /**
     * This method is called by the script whenever the worker is made to terminate.
     * By default this method does nothing but it exists so that you can override it
     * with a custom function to possibly perform cleanup operations if the worker is
     * being made to terminate.
     * @method terminateHandler
     */
    self.terminateHandler = null;

    /**
     * Returns the current state of the worker as an integer.
     * Refer to {{#crossLink "WebWorker/State:property"}}{{/crossLink}} for state values.
     * @method getState
     * @return {Number} An integer representing the current state of the worker.
     */
    self.getState = function () {
        return this._state;
    };

    /**
     * Returns boolean indicating whether the worker (wrapper) script has initialized.
     * @method isInitialized
     * @return {Boolean} Boolean indicating whether the worker (wrapper) script has initialized.
     */
    self.isInitialized = function () {
        var state = self.getState();
        return state !== null && state >= 0;
    };

    /**
     * Returns boolean indicating if the worker script has been initiated to be terminated.
     * @method isTerminating
     * @return {Boolean} Boolean indicating if the worker script has been initiated to be terminated.
     */
    self.isTerminating = function () {
        return self.getState() === State.TERMINATING;
    };

    /**
     * The main worker script that is provided by the user is injected into this function.
     * Also any arguments passed to the {{#crossLink "Wrapper/start:method"}}{{/crossLink}} method are passed on to this function.
     * @method _main
     * @private
     * @chainable
     */
    self._main = function () { return self; };

    /**
     * This method is called when initializing the worker script.
     * It also triggers the WORKER_LOADED event on the base worker instance.
     * @method _init
     * @private
     * @chainable
     */
    self._init = function () {
        self._state = State.INITIALIZED;

        self.trigger(Event.WORKER_LOADED);

        return self;
    };

    /**
     * This method is called by the base worker instance when it's {{#crossLink "WebWorker/start:method"}}{{/crossLink}}
     * method is invoked. It also gets the arguments from the base worker.
     * Internally it calls the {{#crossLink "Wrapper/main:method"}}{{/crossLink}} method with arguments.
     * @method start
     * @chainable
     */
    self.start = function () {
        if (!self.isInitialized()) {
            return self;
        }

        self.triggerSelf(Event.WORKER_STARTING);

        self._main.apply(self, arguments);

        self.triggerSelf(Event.WORKER_STARTED);
        self.trigger(Event.WORKER_STARTED);

        return self;
    };

    /**
     * This method sends data to the base worker instance to be logged.
     * @method log
     * @param {Mixed} data The data to log.
     * @chainable
     */
    self.log = function (data) {
        self.sendMessage(Action.LOG, [data]);
        return self;
    };

    /**
     * This method emulates basic jQuery `.on` event binding behavior.
     * @method on
     * @param {String} eventType The string event type that needs to be bound to.
     * @param {Function} listener The function that will listen to the event.
     * @chainable
     */
    self.on = function (eventType, listener) {
        eventType += '';
        listener = listener || null;

        if (typeof listener !== 'function') {
            return self;
        }

        if (!(eventType in _listeners)) {
            _listeners[eventType] = [];
        }

        _listeners[eventType].push(listener);
        return self;
    };

    /**
     * This method emulates basic jQuery `.one` event binding behavior.
     * @method one
     * @param {String} eventType The string event type that needs to be bound to.
     * @param {Function} listener The function that will listen to the event.
     * @chainable
     */
    self.one = function (eventType, oneListener) {
        var wrapperListener = null;

        wrapperListener = function () {
            oneListener.apply(this, arguments);
            self.off(eventType, wrapperListener);
            return;
        };

        self.on(eventType, wrapperListener);
        return;
    };

    /**
     * This method emulates basic jQuery `.off` event unbinding behavior.
     * @method off
     * @param {String} [eventType] The string event type that needs to be unbound.
     *                             If not provided or passed as `null` all event
     *                             listeners are unbound.
     * @param {Function} [listener] The function that needs to be unbound from the event.
     *                              If not provided or passed as `null` then all event
     *                              listeners for that particular event type are unbound.
     * @chainable
     */
    self.off = function (eventType, listener) {
        var key = null;

        eventType = eventType || null;
        listener = listener || null;

        if (eventType === null && listener === null) {
            for (key in _listeners) {
                delete _listeners[key];
            }
            return self;
        }

        self._removeListenerFromEventType(eventType, listener);

        return self;
    };

    /**
     * Removes an event listener for a particular event type. Optionally if
     * the listener is not passed or is `null` it removes all listeners for
     * the specified event type.
     * @method _removeListenerFromEventType
     * @private
     * @param  {String} eventType Event type for which the listener is
     *                            being removed.
     * @param  {Function} [listener]  The listener that needs to be removed.
     *                                If not passed in or passed as `null`
     *                                all listeners for the specified event
     *                                type are removed.
     * @chainable
     */
    self._removeListenerFromEventType = function (eventType, listener) {
        var listeners = _listeners[eventType],
            i = 0;

        listener = listener || null;
        if (listener === null) {
            _listeners[eventType] = [];
            return self;
        }

        for (; i < listeners.length; i++) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
                i--;
            }
        }
        return self;
    };

    /**
     * Trigger events on the base worker instance.
     * @method trigger
     * @param  {String|Object} event The event to be triggered. Generally
     *                               expected to be a `String` but can
     *                               also be an `Object`.
     * @param  {Mixed} [data] Optional data to associate with the event.
     * @chainable
     */
    self.trigger = function (event, data) {
        var eventType = null;

        event = event || null;

        if (event === null) {
            return self;
        }

        if (typeof event === 'string') {
            eventType = event || null;
            event = {
                "type": eventType
            };
        }
        else if (typeof event === 'object') {
            eventType = event.type || null;
            data = event.data;
        }

        if (eventType === null) {
            return self;
        }

        event.data = data;

        self.sendMessage(Action.TRIGGER_SELF, [event]);
        return self;
    };

    /**
     * Trigger events on the thread worker instance.
     * @method triggerSelf
     * @param  {String|Object} event The event to be triggered. Generally
     *                               expected to be a `String` but can
     *                               also be an `Object`.
     * @param  {Mixed} [data] Optional data to associate with the event.
     * @chainable
     */
    self.triggerSelf = function (event, data) {
        var eventType = null,
            listeners = null,
            listenersCount = null,
            listener = null,
            i = 0;

        event = event || null;

        if (event === null) {
            return this;
        }

        if (typeof event === 'string') {
            eventType = event || null;
            event = {
                "type": event
            };
        }
        else if (typeof event === 'object') {
            eventType = event.type || null;
            data = event.data;
        }

        if (eventType === null) {
            return this;
        }

        event.data = data;

        listeners = _listeners[eventType] || null;

        if (listeners === null) {
            return this;
        }

        listenersCount = listeners.length;

        for (i = 0; i < listenersCount; i++) {
            listener = listeners[i];
            listener.apply(this, [event]);
            if (listenersCount !== listeners.length) {
                i--;
                listenersCount = listeners.length;
            }
        }

        return this;
    };

    /**
     * This method is used to format messages being sent between the worker
     * and the base worker instance. It's usage is similar to the
     * {{#crossLink "WebWorker/sendMessage:method"}}{{/crossLink}} method
     * in the base class.
     * @method sendMessage
     * @param {String} action The name of the method on the base worker instance to call.
     * @param {Array} args An array of arguments to pass to the action.
     * @chainable
     */
    self.sendMessage = function (action, args) {
        var message = null;

        action = action || null;
        args = args || [];

        if (action === null) {
            return self;
        }

        message = {
            "__isWebWorkerMsg": true
        };

        message.action = action;
        message.args = args;

        self.postMessage(message);

        return self;
    };

    /**
     * Terminates the worker from within the worker script.
     * Note that terminates from within the worker are asynchronous.
     * This method calls the
     * {{#crossLink "Wrapper/terminateHandler"}}{{/crossLink}},
     * if it is assigned and is a function, and then goes on to
     * communicate with the base worker class to call the method
     * {{#crossLink "WebWorker/terminateNow:method"}}{{/crossLink}}.
     *
     * The {{#crossLink "WebWorker"}}{{/crossLink}}
     * class does provide a synchronous way to terminate the worker
     * but it is not supported from within the worker script itself.
     *
     * @method terminate
     * @param {Boolean} [terminateNow] If set to `true` the worker
     *                                 also does a `self.close()`
     *                                 after it communicates the
     *                                 terminate status to the base
     *                                 worker instance.
     *                                 It is recommended to use the method
     *                                 {{#crossLink "Wrapper/terminateNow:method"}}{{/crossLink}}
     *                                 to achieve the same goal as
     *                                 it gives a more clear semantics
     *                                 in your code.
     * @chainable
     */
    self.terminate = function (terminateNow) {
        var terminateHandler = null,
            returnValue = null;

        terminateNow = !!terminateNow;
        terminateHandler = self.terminateHandler || null;

        if (!self.isTerminating()) {
            self._setTerminatingStatus();
            self.triggerSelf(Event.WORKER_TERMINATING);
            self.trigger(Event.WORKER_TERMINATING);
        }

        if (typeof terminateHandler === 'function' && !terminateNow) {
            returnValue = terminateHandler.apply(self, arguments);
        }

        self.sendMessage(Action.TERMINATE_NOW, [returnValue]);

        if (terminateNow) {
            self._nativeClose();
        }

        return self;
    };

    /**
     * Terminates the worker _immediately_ from within the worker script.
     * This method internally calls the
     * {{#crossLink "Wrapper/terminate:method"}}{{/crossLink}} method
     * to terminate the worker.
     *
     * Note: Calling this method will NOT invoke the terminate handler.
     * @method terminateNow
     */
    self.terminateNow = function () {
        return self.terminate(true);
    };

    /**
     * Set the worker status to 'terminating'.
     * @method _setTerminatingStatus
     * @private
     * @chainable
     */
    self._setTerminatingStatus = function () {
        self._state = State.TERMINATING;
        return self;
    };

    /**
     * The native worker `close` method is overwritten in the wrapper to
     * give consistent behaviour with the WebWorker class.
     * This method serves as an alias for the native version of the
     * method to be used internally.
     * @method _nativeClose
     * @private
     */
    self._nativeClose = self.close;

    /**
     * The native `close` method is overwritten to serve as an alias for
     * {{#crossLink "Wrapper/terminate:method"}}{{/crossLink}}. This
     * has been done to give a consistent behaviour for the script.
     * You are encouraged to use
     * {{#crossLink "Wrapper/terminateNow:method"}}{{/crossLink}}
     * to terminate the script immediately.
     * @method close
     * @chainable
     */
    self.close = self.terminate;

    // Add a handler for the message event
    self.addEventListener('message', function (event) {
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
        }
    }, false);

    // Initialize the worker
    self._init();
};

WebWorker._workerScriptWrapper = WebWorker._workerScriptWrapper || WorkerWrapperSandbox.loadWorker.toString().replace(/^function \(\) \{([\s\S]+)return;[^}]+?\}$/ig, '$1').replace(/window\._\$blanket[^;]+;/ig, '').replace(/self\._main[^}]+?\};/i, 'self._main = function () {var startArgs=arguments;{{main-function}};return self;};');
