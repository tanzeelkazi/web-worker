/*global jasmine:false, WebWorker:false */
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
                    worker.terminateNow();
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

            describe("getLastError", function () {

                it("should return the last error message", function (done) {
                    var errorMsg1 = null,
                        errorMsg2 = null,
                        Listeners = null;

                    errorMsg1 = "This is error #1!";
                    errorMsg2 = "This is error #2!";

                    Listeners = {
                        "ERROR1": function (event) {
                            expect(event.message).toEqual(errorMsg1);

                            worker.off().on(WebWorkerEvent.ERROR, Listeners.ERROR2);
                            worker.throwError(errorMsg2);
                            return;
                        },

                        "ERROR2": function (event) {
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

            describe("getNativeWorker", function () {

                it("should return the native browser worker once it has loaded, null otherwise", function (done) {
                    worker = new WebWorker(exampleWorkerUrl);

                    expect(worker.getNativeWorker()).toBeNull();

                    worker.on(WebWorkerEvent.WORKER_LOADED, function () {
                        var nativeWorker = null;

                        nativeWorker = worker.getNativeWorker();
                        expect(nativeWorker).not.toBeNull();
                        expect(nativeWorker).toEqual(jasmine.any(window.Worker));
                        done();
                        return;
                    });

                    worker.load();

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

            describe("isTerminateInitialized", function () {

                it("should return true when terminate has initialized, false otherwise", function (done) {
                    var Listeners = null;

                    Listeners = {
                        "LOADED": function (event) {
                            worker.terminate();
                            return;
                        },

                        "TERMINATING": function (event) {
                            expect(worker.isTerminateInitialized()).toBe(true);
                            done();
                            return;
                        }
                    };

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.LOADED);
                    worker.on(WebWorkerEvent.WORKER_TERMINATING, Listeners.TERMINATING);

                    expect(worker.isTerminateInitialized()).toBe(false);

                    worker.load();

                    return;
                });

                return;
            });

            describe("load", function () {

                it("should trigger the WORKER_LOADING event when called", function (done) {

                    var Listeners = {
                        "WORKER_LOADING": function () {
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
                        "WORKER_LOADED": function () {
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

            describe("off", function () {

                it("should be able to unbind events", function (done) {
                    var Listeners = null,
                        isCalledOnce = false;

                    Listeners = {
                        "ERROR1": function (event) {
                            return;
                        },

                        "ERROR2": function (event) {


                            if (isCalledOnce) {
                                expect(Listeners.ERROR1.calls.count()).toEqual(1);
                                expect(Listeners.ERROR2.calls.count()).toEqual(2);
                                done();
                            } else {
                                isCalledOnce = true;
                                expect(Listeners.ERROR1.calls.count()).toEqual(1);
                                expect(Listeners.ERROR2.calls.count()).toEqual(1);

                                worker.off(WebWorkerEvent.ERROR, Listeners.ERROR1);

                                worker.throwError();
                            }

                            return;
                        }
                    };

                    spyOn(Listeners, 'ERROR1').and.callThrough();
                    spyOn(Listeners, 'ERROR2').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR1);
                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR2);

                    worker.throwError();

                    return;
                });

                return;
            });

            describe("on", function () {

                it("should be able to bind events", function (done) {
                    var Listeners = null;

                    Listeners = {
                        "ERROR": function (event) {
                            expect(Listeners.ERROR).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'ERROR').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR);

                    worker.throwError();

                });

                return;
            });

            describe("one", function () {

                it("should be able to bind events for execution only once", function (done) {
                    var Listeners = null,
                        isCalledOnce = false;

                    Listeners = {
                        "ERROR1": function (event) {
                            return;
                        },

                        "ERROR2": function (event) {


                            if (isCalledOnce) {
                                expect(Listeners.ERROR1.calls.count()).toEqual(1);
                                expect(Listeners.ERROR2.calls.count()).toEqual(2);
                                done();
                            } else {
                                isCalledOnce = true;
                                expect(Listeners.ERROR1.calls.count()).toEqual(1);
                                expect(Listeners.ERROR2.calls.count()).toEqual(1);
                                worker.throwError();
                            }

                            return;
                        }
                    };

                    spyOn(Listeners, 'ERROR1').and.callThrough();
                    spyOn(Listeners, 'ERROR2').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.one(WebWorkerEvent.ERROR, Listeners.ERROR1);
                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR2);

                    worker.throwError();

                    return;
                });

                return;
            });

            describe("sendMessage", function () {

                it("should be able to send messages to the native worker with the pre-defined protocol", function (done) {
                    var Listeners = null,
                        nativeWorker = null,
                        testMethodName = 'testMethod',
                        testArgs = [1,2,3];

                    Listeners = {
                        "LOADED": function (event) {
                            nativeWorker = worker.getNativeWorker();

                            spyOn(nativeWorker, 'postMessage').and.callFake(Listeners.POST_MESSAGE);

                            worker.sendMessage(testMethodName, testArgs);
                            return;
                        },

                        "POST_MESSAGE": function (data) {
                            expect(nativeWorker.postMessage).toHaveBeenCalled();

                            expect(data).toEqual(jasmine.any(Object));

                            expect('__isWebWorkerMsg' in data).toBe(true);
                            expect(data.__isWebWorkerMsg).toBe(true);

                            expect('action' in data).toBe(true);
                            expect(data.action).toEqual(testMethodName);

                            expect('args' in data).toBe(true);
                            expect(data.args).toEqual(testArgs);

                            done();

                            return;
                        }
                    };

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.LOADED);

                    worker.load();

                    return;
                });

                return;
            });

            describe("start", function () {

                it("should trigger the WORKER_STARTING event when called", function (done) {

                    var Listeners = {
                        "WORKER_LOADED": function () {
                            worker.start();
                            return;
                        },
                        "WORKER_STARTING": function () {
                            expect(Listeners.WORKER_STARTING).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'WORKER_STARTING').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_STARTING, Listeners.WORKER_STARTING);

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.WORKER_LOADED);

                    worker.load();

                    return;
                });

                it("should trigger the WORKER_STARTED event once the worker has started", function (done) {

                    var Listeners = {
                        "WORKER_LOADED": function () {
                            worker.start();
                            return;
                        },
                        "WORKER_STARTED": function () {
                            expect(Listeners.WORKER_STARTED).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'WORKER_STARTED').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorker.Event.WORKER_STARTED, Listeners.WORKER_STARTED);

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.WORKER_LOADED);

                    worker.load();

                    return;
                });

                return;
            });

            describe("terminate", function () {

                it("should trigger the WORKER_TERMINATING event and call the worker to terminate", function (done) {
                    var Listeners = null;

                    Listeners = {
                        "LOADED": function (event) {
                            worker.terminate();
                            expect(WebWorker.prototype.sendMessage).toHaveBeenCalled();
                            return;
                        },

                        "TERMINATING": function (event) {
                            expect(Listeners.TERMINATING).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(WebWorker.prototype, 'sendMessage').and.callThrough();
                    spyOn(Listeners, 'TERMINATING').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.LOADED);
                    worker.on(WebWorkerEvent.WORKER_TERMINATING, Listeners.TERMINATING);

                    worker.load();

                    return;
                });

                return;
            });

            describe("terminateNow", function () {

                it("should trigger the WORKER_TERMINATING and WORKER_TERMINATED events and terminate the worker immediately", function (done) {
                    var Listeners = null;

                    Listeners = {
                        "LOADED": function (event) {
                            worker.terminateNow();
                            return;
                        },

                        "TERMINATING": function (event) {
                            expect(Listeners.TERMINATING).toHaveBeenCalled();
                            return;
                        },

                        "TERMINATED": function (event) {
                            expect(Listeners.TERMINATED).toHaveBeenCalled();
                            expect(WebWorker.prototype.sendMessage).toHaveBeenCalled();
                            expect(worker.getNativeWorker()).toBeNull();

                            done();

                            return;
                        }
                    };

                    spyOn(WebWorker.prototype, 'sendMessage').and.callThrough();
                    spyOn(Listeners, 'TERMINATING').and.callThrough();
                    spyOn(Listeners, 'TERMINATED').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.LOADED);
                    worker.on(WebWorkerEvent.WORKER_TERMINATING, Listeners.TERMINATING);
                    worker.on(WebWorkerEvent.WORKER_TERMINATED, Listeners.TERMINATED);

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
                        "ERROR": function (event) {
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

            describe("trigger", function () {

                it("should be able to trigger events", function (done) {
                    var eventType = null,
                        Listeners = null;

                    eventType = "webworker:initialized";

                    Listeners = {
                        "INITIALIZED": function (event) {
                            expect(Listeners.INITIALIZED).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'INITIALIZED').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(eventType, Listeners.INITIALIZED);
                    worker.trigger(eventType);

                    return;
                });

                return;
            });

            describe("triggerSelf", function () {

                it("should do something");

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
