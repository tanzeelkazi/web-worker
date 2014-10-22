/*global WebWorker:false */
(function () {
    'use strict';

    var worker = null,
        WebWorkerEvent = null,
        exampleWorkerUrl = null;

    WebWorkerEvent = WebWorker.Event;
    exampleWorkerUrl = "/js/example-worker.js";

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
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker).not.toBe(null);
                    return;
                });

                return;
            });

            describe("load", function () {

                it("should trigger the WORKER_LOADING event when called", function (done) {

                    var Listeners = {
                        WORKER_LOADING: function () {
                            expect(Listeners.WORKER_LOADING).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'WORKER_LOADING').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_LOADING, Listeners.WORKER_LOADING);

                    worker.load();

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

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.WORKER_LOADED);

                    worker.load();

                    return;
                });

                return;
            });

            describe("start", function () {

                it("should trigger the WORKER_STARTING event when called", function (done) {

                    var Listeners = {
                        WORKER_STARTING: function () {
                            expect(Listeners.WORKER_STARTING).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'WORKER_STARTING').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_STARTING, Listeners.WORKER_STARTING);

                    worker.on(WebWorkerEvent.WORKER_LOADED, worker.start);

                    worker.load();

                    return;
                });

                xit("should trigger the WORKER_STARTED event once the worker has started", function (done) {

                    var Listeners = {
                        WORKER_STARTED: function () {
                            expect(Listeners.WORKER_STARTED).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'WORKER_STARTED').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorker.Event.WORKER_STARTED, Listeners.WORKER_STARTED);

                    worker.on(WebWorkerEvent.WORKER_LOADED, worker.start);

                    worker.load();

                    return;
                });

                return;
            });

            describe("terminate", function () {

                it("should terminate the worker", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    spyOn(worker, 'terminate').and.callThrough();
                    worker.terminate();
                    expect(worker.terminate).toHaveBeenCalled();
                    return;
                });

                return;
            });

            describe("getUrl", function () {

                it("should return the worker Url", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.getUrl()).toEqual(exampleWorkerUrl);
                    return;
                });

                return;
            });

            describe("getBlobUrl", function () {

                it("should return the blob Url once the worker has loaded", function (done) {
                    worker = new WebWorker(exampleWorkerUrl);

                    expect(worker.getBlobUrl()).toBeNull();

                    worker.on(WebWorkerEvent.WORKER_LOADED, function () {
                        expect(worker.getBlobUrl()).not.toBeNull();
                        done();
                        return;
                    });

                    worker.load();

                    return;
                });

                return;
            });

            describe("hasLoaded", function () {

                it("should return true once the worker has loaded, false otherwise", function (done) {
                    worker = new WebWorker(exampleWorkerUrl);

                    expect(worker.hasLoaded()).toBe(false);

                    worker.on(WebWorkerEvent.WORKER_LOADED, function () {
                        expect(worker.hasLoaded()).toBe(true);
                        done();
                        return;
                    });

                    worker.load();

                    return;
                });

                return;
            });

            describe("throwError", function () {

                it("should trigger the ERROR event with the error message", function (done) {
                    var errorMsg = null,
                        Listeners = null;

                    errorMsg = "This is an error!";
                    Listeners = {
                        ERROR: function (event) {
                            expect(Listeners.ERROR).toHaveBeenCalled();
                            expect(event.message).toEqual(errorMsg);
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'ERROR').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR);

                    worker.throwError(errorMsg);

                    return;
                });

                return;
            });

            describe("getLastError", function () {

                it("should return the last error message", function (done) {
                    var errorMsg1 = null,
                        errorMsg2 = null,
                        Listeners = null;

                    errorMsg1 = "This is error #1!";
                    errorMsg2 = "This is error #2!";

                    Listeners = {
                        ERROR1: function (event) {
                            expect(event.message).toEqual(errorMsg1);

                            worker.off().on(WebWorkerEvent.ERROR, Listeners.ERROR2);
                            worker.throwError(errorMsg2);
                            return;
                        },

                        ERROR2: function (event) {
                            expect(event.message).toEqual(errorMsg2);
                            done();
                            return;
                        }
                    };

                    worker = new WebWorker(exampleWorkerUrl);

                    expect(worker.getLastError()).toBeNull();

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR1);
                    worker.throwError(errorMsg1);

                    return;
                });

                return;
            });

            describe("on", function () {
                return;
            });

            describe("one", function () {
                return;
            });

            describe("off", function () {
                return;
            });

            describe("trigger", function () {

                it("should be able to trigger events", function (done) {
                    var eventType = null,
                        Listeners = null;

                    eventType = "some-event";

                    Listeners = {
                        SOME_EVENT: function (event) {
                            expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(eventType, Listeners.SOME_EVENT);
                    worker.trigger(eventType);

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
