(function () {
    'use strict';

    var counter = 0;

    return;
    
    setInterval(function () {
        self.postMessage(counter);
        counter++;
    }, 10);

    return;
})();