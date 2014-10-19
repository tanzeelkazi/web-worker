

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

self.postMessage({
    action: 'trigger',
    data: {
        args: [
            'webworker:worker-loaded'
        ]
    }
});