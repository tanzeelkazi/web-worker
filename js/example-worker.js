(function () {
    'use strict';
    var Action = null,
        Event = null,
        Listeners = null;

    Action = {
        INIT: 'init',
        START: 'start',
        TRIGGER: 'trigger'
    };

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

    // Add eventPrefix to all event types
    for (var key in Event) {
        Event[key] = 'webworker:' + Event[key];
    }

    self.hasInitialized = false;

    Listeners = {};
    self.Listeners = Listeners;

    self.terminateHandler = null;

    self.main = function () {
        (function () {

            self.on('tk', function () {
                self.postMessage('chal gaya boss');
            });

            return;
            var counter = 0,
                timer = null;


            timer = setInterval(function () {
                counter++;
                self.postMessage(counter);

                if (counter === 50) {
                    clearInterval(timer);
                    self.close();
                }

                return;
            }, 10);

            return;
        })();
        return;
    };

    self.init = function () {
        self.hasInitialized = true;

        self.trigger(Event.WORKER_LOADED);

        return self;
    };

    self.start = function () {
        if (!self.hasInitialized) {
            return false;
        }

        self.main.apply(self, arguments);

        self.trigger(Event.WORKER_STARTED);
        return self;
    };

    self.on = function (eventType, listener) {
        eventType += '';
        listener = listener || null;

        if (typeof listener !== 'function') {
            return self;
        }

        if (!(eventType in Listeners)) {
            Listeners[eventType] = [];
        }

        Listeners[eventType].push(listener);
        return self;
    };

    self.one = function (eventType, listener) {
        var wrapperListener = null;

        wrapperListener = function () {
            listener.apply(this, arguments);
            self.off(eventType, wrapperListener);
            return;
        };

        self.on(eventType, wrapperListener);
        return;
    };

    self.off = function (eventType, listener) {
        var key = null;

        eventType = eventType || null;
        listener = listener || null;

        if (eventType === null && listener === null) {
            for (key in Listeners) {
                delete Listeners[key];
            }
            return self;
        }

        for (key in Listeners) {
            self._removeListenerFromEventType(key, listener);
        }

        return self;
    };

    self._removeListenerFromEventType = function (eventType, listener) {
        var listeners = Listeners[eventType];

        listener = listener || null;
        if (listener === null) {
            Listeners[eventType] = [];
            return self;
        }

        for (var i = 0; i < listeners.length; i++) {
            if (listeners[i] === listener) {
                listeners.splice(i, 1);
                i--;
            }
        }
        return self;
    };

    self.trigger = function (event, data) {

        var eventType = null;

        if (typeof event === 'string') {
            eventType = event || null;
        }
        else if (typeof event === 'object') {
            eventType = event.type || null;
            data = event.data;
        }

        if (eventType === null) {
            return self;
        }

        event.data = data;

        self.sendMessage(Action.TRIGGER, [eventType, data]);
        return self;
    };


    self.triggerSelf = function (event, data) {

        var worker = this,
            eventType = null,
            listeners = null,
            listenersCount = null,
            listener = null;

        if (typeof event === 'string') {
            eventType = event || null;
        }
        else if (typeof event === 'object') {
            eventType = event.type || null;
            data = event.data;
        }

        if (eventType === null) {
            return self;
        }

        event.data = data;

        listeners = Listeners[eventType] || null;
        if (listeners === null) {
            return self;
        }

        listenersCount = listeners.length;

        for (var i = 0; i < listenersCount; i++) {
            listener = listeners[i];
            listener.apply(worker, [event]);
        }

        return self;
    };

    self.sendMessage = function (action, args) {
        var message = null;

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

        self.postMessage(message);

        return self;
    };

    self.terminate = function () {
        var terminateHandler = null,
            returnValue = null;

        terminateHandler = self.terminateHandler || null;
        if (typeof terminateHandler === 'function') {
            returnValue = terminateHandler.apply(self, arguments);
        }

        self.sendMessage(Event.WORKER_TERMINATED, [returnValue]);
        return;
    };

    self.onmessage = function (event) {
        var originalEvent = event.originalEvent || event,
            msg = originalEvent.data,
            action = null,
            args = null;

        if ((typeof msg === 'object')
            && ('__isWebWorkerMsg' in msg)
            && (msg.__isWebWorkerMsg)) {
            action = msg.action;
            args = msg.args;

            self[action].apply(self, args);
            return;
        }

        return;
    };

    self.init();

    return;
})();
