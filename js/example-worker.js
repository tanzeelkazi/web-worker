(function () {
    var Event = {
        INITIALIZED: 'init',

        WORKER_LOADED: 'worker-loaded'
    };

    // Add eventPrefix to all event types
    for (var key in Event) {
        Event[key] = 'webworker:' + Event[key];
    }

    self.main = function () {
        (function () {
            'use strict';

            var counter = 0,
                timer = null;


            timer = setInterval(function () {
                counter++;
                self.postMessage(counter);

                if (counter === 10000) {
                    clearInterval(timer);
                    self.close();
                }

                return;
            }, 10);

            return;
        })();
        return;
    };

    self.hasInitialized = false;

    self.init = function (opts) {
        self.hasInitialized = true;
        return;
    };

    self.onmessage = function (event) {
        var msg = event.data;
        if (!hasInitialized) {
            if (('action' in msg) && msg.action === 'init') {
                self.init.apply(self, msg.data.args);
            }
            return;
        }
        return;
    };
    
    self.postMessage({
        action: 'trigger',
        data: {
            args: [
                'webworker:worker-loaded'
            ]
        }
    });

    return;
})();