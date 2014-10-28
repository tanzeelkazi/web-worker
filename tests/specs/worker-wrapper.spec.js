/*global jasmine:false, WebWorker:false WorkerWrapperSandbox:false */
(function () {
    'use strict';

    var worker = null,
        WebWorkerAction = null,
        WebWorkerEvent = null,
        exampleWorkerElemSelector = null,
        exampleWorkerUrl = null;

    WebWorkerAction = WebWorker.Action;
    WebWorkerEvent = WebWorker.Event;

    exampleWorkerElemSelector = "#test-worker-script-elem";
    exampleWorkerUrl = "/js/example-worker.js";

    describe("WorkerWrapper", function () {

        describe("sandbox", function () {

            it("should be defined", function () {
                expect(WorkerWrapperSandbox).toBeDefined();
                return;
            });

            it("should have the postMessage method", function () {
                expect(typeof WorkerWrapperSandbox.postMessage).toEqual('function');
                return;
            });

            it("should have the addEventListener method", function () {
                expect(typeof WorkerWrapperSandbox.addEventListener).toEqual('function');
                return;
            });

            it("should have the onmessage property", function () {
                expect(WorkerWrapperSandbox.onmessage).toBeNull();
                return;
            });

            it("should have the loadWorker method", function () {
                expect(typeof WorkerWrapperSandbox.loadWorker).toEqual('function');
                return;
            });

            return;
        });

        spyOn(WorkerWrapperSandbox, 'postMessage').and.callThrough();

        describe("loading", function () {

            it("should trigger the init function and send the trigger WORKER_LOADED to the base worker instance", function () {
                return;
            })
            return;
        });

        return;
    });

    return;
})();
