﻿/*global jasmine:false, WebWorker:false */
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

                it("should throw an exception for invalid arguments", function () {
                    var isError = false;

                    try {
                        worker = new WebWorker();
                    } catch (err) {
                        isError = true;
                        expect(err.message).toEqual(WebWorker.Error.INVALID_ARGUMENTS);
                    }

                    expect(isError).toBe(true);
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

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.load()).toEqual(worker);
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

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.off()).toEqual(worker);
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

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.on()).toEqual(worker);
                    return;
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

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.one()).toEqual(worker);
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

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.sendMessage()).toEqual(worker);
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

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.start()).toEqual(worker);
                    return;
                });

                return;
            });

            describe("terminate", function () {

                it("should trigger the WORKER_TERMINATING event and call the worker to terminate", function (done) {
                    var Listeners = null,
                        isTerminateCalled = false,
                        isEventCalled = false;

                    function checkAndComplete() {
                        if (isTerminateCalled && isEventCalled) {
                            expect(worker.sendMessage).toHaveBeenCalled();
                            expect(Listeners.TERMINATING).toHaveBeenCalled();
                            done();
                        }
                        return;
                    }

                    Listeners = {
                        "LOADED": function (event) {
                            setTimeout(function () {
                                worker.terminate();
                                isTerminateCalled = true;
                                checkAndComplete();
                            }, 100);
                            return;
                        },

                        "TERMINATING": function (event) {
                            isEventCalled = true;
                            checkAndComplete();
                            return;
                        }
                    };

                    worker = new WebWorker(exampleWorkerUrl);

                    spyOn(worker, 'sendMessage').and.callThrough();
                    spyOn(Listeners, 'TERMINATING').and.callThrough();

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.LOADED);
                    worker.on(WebWorkerEvent.WORKER_TERMINATING, Listeners.TERMINATING);

                    worker.load();

                    return;
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.terminate()).toEqual(worker);
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
                            return;
                        },

                        "TERMINATED": function (event) {
                            expect(Listeners.TERMINATING).toHaveBeenCalled();
                            expect(Listeners.TERMINATED).toHaveBeenCalled();
                            expect(worker.sendMessage).not.toHaveBeenCalled();
                            expect(worker.getNativeWorker()).toBeNull();

                            done();

                            return;
                        }
                    };

                    spyOn(Listeners, 'TERMINATING').and.callThrough();
                    spyOn(Listeners, 'TERMINATED').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    spyOn(worker, 'sendMessage').and.callThrough();
                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.LOADED);
                    worker.on(WebWorkerEvent.WORKER_TERMINATING, Listeners.TERMINATING);
                    worker.on(WebWorkerEvent.WORKER_TERMINATED, Listeners.TERMINATED);

                    worker.load();

                    return;
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.terminateNow()).toEqual(worker);
                    return;
                });

                return;
            });

            describe("throwError", function () {

                it("should be able to trigger the ERROR event with the specified error message", function (done) {
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

                it("should be able to trigger the ERROR event with the specified error message and data", function (done) {
                    var errorMsg = null,
                        data = null,
                        Listeners = null;

                    errorMsg = "This is an error!";
                    data = {
                        "test": true
                    };

                    Listeners = {
                        "ERROR": function (event) {
                            expect(Listeners.ERROR).toHaveBeenCalled();
                            expect(event.message).toEqual(errorMsg);
                            expect(event.errorData).toEqual(data);
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'ERROR').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR);

                    worker.throwError(errorMsg, data);

                    return;
                });

                it("should be able to trigger the ERROR event with the specified error message and data and throw an exception", function (done) {
                    var errorMsg = null,
                        data = null,
                        Listeners = null;

                    errorMsg = "This is an error!";
                    data = {
                        "test": true
                    };

                    Listeners = {
                        "ERROR": function (event) {
                            expect(Listeners.ERROR).toHaveBeenCalled();
                            expect(event.message).toEqual(errorMsg);
                            expect(event.errorData).toEqual(data);
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'ERROR').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR);

                    spyOn(worker, 'throwError').and.callThrough();

                    try {
                        worker.throwError(errorMsg, data, true);
                    } catch (err) {
                        expect(err.message).toEqual(errorMsg);
                    }

                    return;
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.throwError()).toEqual(worker);
                    return;
                });

                return;
            });

            describe("trigger", function () {

                it("should be able to trigger internal events on the worker instance and pass other events to the worker", function (done) {
                    var Listeners = null,
                        nativeWorker = null,
                        eventType1 = null,
                        eventType2 = null;

                    Listeners = {
                        "LOADED": function (event) {
                            nativeWorker = worker.getNativeWorker();
                            spyOn(nativeWorker, 'postMessage').and.callFake(Listeners.POST_MESSAGE);

                            worker.trigger(eventType1);
                            worker.trigger(eventType2);

                            return;
                        },

                        "INITIALIZED": function (event) {
                            expect(Listeners.INITIALIZED).toHaveBeenCalled();
                            expect(Listeners.POST_MESSAGE).not.toHaveBeenCalled();
                            return;
                        },

                        "SOME_EVENT": function (event) {
                            return;
                        },

                        "POST_MESSAGE": function (data) {

                            expect(Listeners.SOME_EVENT).not.toHaveBeenCalled();
                            expect(Listeners.POST_MESSAGE).toHaveBeenCalled();

                            done();

                            return;
                        }
                    };

                    spyOn(Listeners, 'INITIALIZED').and.callThrough();
                    spyOn(Listeners, 'SOME_EVENT').and.callThrough();
                    spyOn(Listeners, 'POST_MESSAGE').and.callThrough();

                    eventType1 = WebWorkerEvent.INITIALIZED;
                    eventType2 = 'some-event';

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.LOADED);
                    worker.on(eventType1, Listeners.INITIALIZED);
                    worker.on(eventType2, Listeners.SOME_EVENT);

                    worker.load();

                    return;
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.trigger()).toEqual(worker);
                    return;
                });

                return;
            });

            describe("triggerSelf", function () {

                it("should be able to trigger any event on the worker instance", function (done) {
                    var someEventType = null,
                        Listeners = null;

                    Listeners = {
                        "INITIALIZED": function (event) {
                            expect(Listeners.INITIALIZED).toHaveBeenCalled();
                            return;
                        },

                        "SOME_EVENT": function (event) {
                            expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                            done();
                            return;
                        }
                    };

                    spyOn(Listeners, 'INITIALIZED').and.callThrough();
                    spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    someEventType = 'some-event';

                    worker.on(WebWorkerEvent.INITIALIZED, Listeners.INITIALIZED);
                    worker.on(someEventType, Listeners.SOME_EVENT);

                    worker.triggerSelf(WebWorkerEvent.INITIALIZED);
                    worker.triggerSelf(someEventType, null);

                    return;
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.triggerSelf()).toEqual(worker);
                    return;
                });

                return;
            });

            return;
        });

        describe("static", function () {

            describe("getLastError", function () {

                it("should be able to retrieve the last error thrown amongst all worker instances", function () {
                    var worker1 = null,
                        worker2 = null,
                        errorMsg1 = null,
                        errorMsg2 = null;

                    errorMsg1 = "This is error #1";
                    errorMsg2 = "This is error #2";

                    worker1 = new WebWorker(exampleWorkerUrl);

                    expect(worker1.getLastError()).toBeNull();

                    worker1.throwError(errorMsg1);
                    expect(worker1.getLastError()).toEqual(errorMsg1);
                    expect(WebWorker.getLastError()).toEqual(errorMsg1);

                    worker1.terminateNow();


                    worker2 = new WebWorker(exampleWorkerUrl);

                    expect(worker2.getLastError()).toBeNull();

                    worker2.throwError(errorMsg2);
                    expect(worker1.getLastError()).toEqual(errorMsg1);
                    expect(worker2.getLastError()).toEqual(errorMsg2);
                    expect(WebWorker.getLastError()).toEqual(errorMsg2);

                    worker2.terminateNow();

                    return;
                });

                return;
            });

            describe("noConflict", function () {
                var cachedWebWorker = window.WebWorker;

                afterEach(function () {
                    window.WebWorker = cachedWebWorker;
                    return;
                });

                it("should be able to remove WebWorker from the window object and re-insert into the context and classname provided", function () {
                    var someContext = {},
                        someClassName = 'someClass',
                        returnValue = null;

                    expect(window.WebWorker).toBeDefined();

                    returnValue = WebWorker.noConflict(someContext, someClassName);

                    expect(someContext[someClassName]).toBeDefined();
                    expect(returnValue).not.toBeNull();

                    return;
                });

                it("should be able to remove WebWorker from the window object even if context and classname are not provided", function () {
                    var returnValue = null;

                    expect(window.WebWorker).toBeDefined();

                    returnValue = WebWorker.noConflict();

                    expect(returnValue).not.toBeNull();

                    return;
                });

                return;
            });

            return;
        });

        return;
    });

    return;
})();
