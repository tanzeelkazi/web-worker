(function () {
    'use strict';
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
