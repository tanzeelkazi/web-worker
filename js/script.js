/*global WebWorker:false */
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
    window.worker = worker;

    worker.on('message', function (event) {
        $output.text(event.data);
        return;
    });


    worker.on(WebWorker.Event.WORKER_LOADING, function () {
        console.log('worker loading');
        return;
    });

    worker.on(WebWorker.Event.WORKER_LOADED, function () {
        console.log('has loaded');
        worker.start();
        return;
    });

    worker.on(WebWorker.Event.WORKER_STARTING, function () {
        console.log('worker starting');
        return;
    });

    worker.on(WebWorker.Event.WORKER_STARTED, function () {
        console.log('worker started');
        return;
    });

    worker.load();

    return;
})();
