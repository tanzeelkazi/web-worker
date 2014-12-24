/*global WebWorker:false */
(function () {
    'use strict';

    var worker,
        exampleWorkerUrl,
        log,
        logTimer,
        logTimeExceeded = false,
        $input,
        $console,
        msgCount = 0,
        lastMsg,
        msgRepeatIndex,
        $btnProcess,
        startTime = new Date(),
        timeTaken;

    log = function (msg) {
        var $el = $('<pre />'),
            curMsg;

        curMsg = msg + '';

        msgCount++;

        function updateRepeatMsg(msgCount) {
            var msgRepeatCount,
                $previousEl;

            msgRepeatCount = msgCount - msgRepeatIndex + 1;
            if (msgRepeatCount < 2) {
                return;
            }

            $previousEl = $console.find('pre:last-child');
            $previousEl.find('strong').text('Messages #' + msgRepeatIndex + '-' + msgCount + ' (' + (msgCount - msgRepeatIndex + 1) + ')');
        }

        if (curMsg === lastMsg) {
            if (!logTimeExceeded) {
                return;
            }
            updateRepeatMsg(msgCount);
        } else {
            if (!logTimeExceeded) {
                updateRepeatMsg(msgCount - 1);
            }
            $el.append($('<strong />').text('Message #' + msgCount))
               .append($('<span />').text('\n' + curMsg));

            $console.append($el)
                    .scrollTop($console.height());

           lastMsg = curMsg;
           msgRepeatIndex = msgCount;
        }

        clearTimeout(logTimer);
        logTimeExceeded = false;
        logTimer = setTimeout(function () { logTimeExceeded = true; }, 100);
    };

    window.log = log;

    exampleWorkerUrl = 'js/example-worker.js';

    $console = $('.console');

    $('.clear-console').on('click', function () {
        $console.find('pre').remove();
    });

    function doIntensiveCalculations() {
        log('start calculations');

        var firstTerm = 1,
            commonRatio = -0.3,
            termsCount = 100000000,
            sum = 0,
            i;

        startTime = new Date();

        for (i = 1; i <= termsCount; i++) {
            sum += firstTerm * Math.pow(commonRatio, i);
            if (!(i % 10000)) {
                log('sum = ' + sum);
            }
        }

        log('calculations complete');
        timeTaken = new Date() - startTime;
        log('time taken: ' + (timeTaken > 1000 ? timeTaken / 1000 + 'sec' : timeTaken + 'ms'));
        log('Final sum = ' + sum);
    }

    $input = $('input, button');

    $btnProcess = $('.process');
    $btnProcess.on('click', function () {
        var useWebWorker = $(this).hasClass('use-webworker');

        $input.prop('disabled', true);

        if (useWebWorker) {
            log('Using web worker');

            worker = new WebWorker(exampleWorkerUrl);
            worker.loaded(function () {
                    worker.start();
                })
                .started(function () {
                    log('start calculations');
                    startTime = new Date();
                    worker.trigger('start-calculation');
                });

            worker.on('sum-update', function (event) {
                log('sum-update event\nsum = ' + event.originalEvent.data);
            })
            .on('final-sum', function (event) {
                timeTaken = new Date() - startTime;
                log('time taken: ' + (timeTaken > 1000 ? timeTaken / 1000 + 'sec' : timeTaken + 'ms'));
                log('final-sum event\nsum = ' + event.originalEvent.data);
                worker.terminate();
                $input.prop('disabled', false);
            });

            worker.load();
        } else {
            log('NOT using web worker');
            doIntensiveCalculations();
            $input.prop('disabled', false);
        }
    });

    return;
})();
