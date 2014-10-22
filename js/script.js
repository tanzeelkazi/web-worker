(function () {
    'use strict';

    var worker = null,
        $output = null;

    $output = $('#worker-output');

    /**
    worker = new Worker('/js/example-worker.js');

    worker.addEventListener('message', function (event) {
        $output.text(event.data);
        return;
    })

    //worker.postMessage();
    /**/

    worker = new WebWorker('/js/example-worker.js');

    worker.on('message', function (event) {
        $output.text(event.data);
        return;
    });

    worker.load().on(WebWorker.Event.WORKER_LOADED, function () {
        console.log('has loaded');
        worker.start();
        return;
    });

    return;
})();