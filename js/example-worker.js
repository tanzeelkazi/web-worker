(function () {
    'use strict';

    self.on('start-calculation', function () {
        self.postMessage('help help help');
        var firstTerm = 1,
            commonRatio = -0.3,
            termsCount = 100000000,
            sum = 0,
            i;

        for (i = 1; i <= termsCount; i++) {
            sum += firstTerm * Math.pow(commonRatio, i);
            if (!(i % 10000)) {
                self.trigger('sum-update', sum);
            }
        }

        self.trigger('final-sum', sum);
    });

    // Received a ping on the webworker from the base page
    self.on('ping', function () {
        // Trigger a ping on the base page from the webworker
        self.trigger('ping');
    });

    return;
})();
