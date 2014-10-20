(function () {
    'use strict';

    var worker = null;

    describe("WebWorker", function () {

        it("should be defined", function () {
            expect(WebWorker).toBeDefined();
            return;
        });

        describe("instance", function () {
            
            afterEach(function () {
                if (worker) {
                    worker.terminate();
                }
                worker = null;
                return;
            });

            describe("constructor", function () {

                it("should accept string selector if first argument is string and if the element exists", function () {
                    worker = new WebWorker("#test-worker-script-elem");
                    expect(worker).not.toBe(null);
                    return;
                });

                it("should accept string URL if first argument is string and an element of same selector does not exist", function () {
                    worker = new WebWorker("/js/example-worker.js");
                    expect(worker).not.toBe(null);
                    return;
                });

                it("should support terminating the worker", function () {
                    worker = new WebWorker("/js/example-worker.js");
                    spyOn(worker, 'terminate');
                    worker.terminate();
                    expect(worker.terminate).toHaveBeenCalled();
                    return;
                });

                it("should trigger the WORKER_LOADED event once the worker has loaded", function (done) {

                    var Listeners = {
                        WORKER_LOADED: function () {
                            expect(Listeners.WORKER_LOADED).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'WORKER_LOADED').and.callThrough();

                    worker = new WebWorker("/js/example-worker.js");
                    worker.on(WebWorker.Event.WORKER_LOADED, Listeners.WORKER_LOADED);

                    return;
                });

                return;
            });

            return;
        });

        describe("static", function () {
        });

        return;
    });

    return;
})();