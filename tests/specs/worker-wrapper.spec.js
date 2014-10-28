/*global jasmine:false, WebWorker:false WorkerWrapperSandbox:false */
(function () {
    'use strict';

    var worker = null,
        WebWorkerAction = null,
        WebWorkerEvent = null,
        exampleWorkerElemSelector = null,
        exampleWorkerUrl = null,
        $WorkerWrapperSandbox = null;

    WebWorkerAction = WebWorker.Action;
    WebWorkerEvent = WebWorker.Event;

    exampleWorkerElemSelector = "#test-worker-script-elem";
    exampleWorkerUrl = "/js/example-worker.js";

    $WorkerWrapperSandbox = $(WorkerWrapperSandbox);

    function runPostMessageExpectation(spy, action, args) {
        var mostRecentCall = null,
            data = null,
            dataArgs = null,
            i = 0;

        expect(spy).toHaveBeenCalled();

        mostRecentCall = spy.calls.mostRecent();
        data = mostRecentCall.args[0];
        dataArgs = data.args;

        expect('__isWebWorkerMsg' in data).toBe(true);
        expect(data.__isWebWorkerMsg).toBe(true);

        expect(data.action).toBe(action);

        expect(dataArgs.length).toEqual(args.length);

        for (; i < data.length; i++) {
            expect(dataArgs[i]).toEqual(args[i]);
        }

        return;
    }

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

        describe("loading the worker", function () {

            it("should send the trigger WORKER_LOADED to the base worker instance", function () {

                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.loadWorker();

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, 'trigger', [WebWorkerEvent.WORKER_LOADED]);

                return;
            });

            return;
        });

        describe("close", function () {

            it("should be an alias for the terminate method", function () {
                expect(WorkerWrapperSandbox.close).toEqual(WorkerWrapperSandbox.terminate);
                return;
            });

            return;
        });

        describe("init", function () {

            it("should set isInitialized to true", function () {

                WorkerWrapperSandbox._isInitialized = false;

                expect(WorkerWrapperSandbox.isInitialized()).toBe(false);

                WorkerWrapperSandbox.init();

                expect(WorkerWrapperSandbox.isInitialized()).toBe(true);

                return;
            });

            it("should send the trigger WORKER_LOADED to the base worker instance", function () {

                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.init();

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, 'trigger', [WebWorkerEvent.WORKER_LOADED]);

                return;
            });

            return;
        });

        describe("isInitialized", function () {

            it("should return the value for isInitialized", function () {

                WorkerWrapperSandbox._isInitialized = false;
                expect(WorkerWrapperSandbox.isInitialized()).toBe(false);

                WorkerWrapperSandbox._isInitialized = true;
                expect(WorkerWrapperSandbox.isInitialized()).toBe(true);

                return;
            });

            return;
        });

        describe("isTerminating", function () {

            it("should return the value for isTerminating", function () {

                WorkerWrapperSandbox._isTerminating = false;
                expect(WorkerWrapperSandbox.isTerminating()).toBe(false);

                WorkerWrapperSandbox._isTerminating = true;
                expect(WorkerWrapperSandbox.isTerminating()).toBe(true);

                return;
            });

            return;
        });

        describe("off", function () {
            return;
        });

        describe("on", function () {
            return;
        });

        describe("one", function () {
            return;
        });

        describe("sendMessage", function () {
            return;
        });

        describe("start", function () {

            it("should NOT start the worker if it is NOT initialized", function () {
                spyOn(WorkerWrapperSandbox, '_main');

                WorkerWrapperSandbox._isInitialized = false;
                WorkerWrapperSandbox.start();

                expect(WorkerWrapperSandbox.isInitialized()).toBe(false);
                expect(WorkerWrapperSandbox._main).not.toHaveBeenCalled();

                return;
            });

            it("should start the worker if it is initialized", function () {
                spyOn(WorkerWrapperSandbox, '_main');

                WorkerWrapperSandbox._isInitialized = true;
                WorkerWrapperSandbox.start();

                expect(WorkerWrapperSandbox.isInitialized()).toBe(true);
                expect(WorkerWrapperSandbox._main).toHaveBeenCalled();

                return;
            });

            it("should send the WORKER_STARTED event to the base instance once started", function () {
                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.start();

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, 'trigger', [WebWorkerEvent.WORKER_STARTED]);
                return;
            });

            return;
        });

        describe("terminate", function () {
            return;
        });

        describe("terminateHandler", function () {
            return;
        });

        describe("terminateNow", function () {
            return;
        });

        describe("trigger", function () {
            return;
        });

        describe("triggerSelf", function () {
            return;
        });

        return;
    });

    return;
})();
