(function () {
    'use strict';

    var worker = null,
        $output = null;

    $output = $('#worker-output');

    worker = new Worker('/js/example-worker.js');

    worker.addEventListener('message', function (event) {
        $output.text(event.data);
        return;
    })

    //worker.postMessage();

    return;
})();