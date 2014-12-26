/*global Event:false, jasmine:false, WebWorker:false */
(function () {
    'use strict';

    var worker = null,
        WebWorkerEvent = null,
        WebWorkerState = null,
        exampleWorkerElemSelector = null,
        exampleWorkerUrl = null;

    WebWorkerEvent = WebWorker.Event;
    WebWorkerState = WebWorker.State;

    exampleWorkerElemSelector = "#test-worker-script-elem";
    exampleWorkerUrl = "/js/example-worker.js";


    describe("WebWorker", function () {

        it("should be defined", function () {
            expect(WebWorker).toBeDefined();
        });

        describe("instance", function () {

            afterEach(function () {
                if (worker) {
                    worker.terminateNow();
                }
                worker = null;
            });


            describe("callback", function () {

                function runCallbackTest(stackId, callbackExecutor) {
                    describe(stackId, function () {

                        afterEach(function () {
                            worker.terminate();
                            worker = null;
                        });

                        it("should take a function as an argument and add it to the callback list", function () {
                            var Listeners = {
                                "callback": function () {}
                            };

                            worker = new WebWorker(exampleWorkerUrl);
                            worker[stackId](Listeners.callback);

                            expect(worker._callbackStack[stackId]).toContain(Listeners.callback);
                        });

                        it("should not add non-functions to the callback list", function () {
                            var Listeners = {
                                "callback": {}
                            };

                            worker = new WebWorker(exampleWorkerUrl);
                            worker[stackId](Listeners.callback);

                            expect(worker._callbackStack[stackId]).not.toContain(Listeners.callback);
                        });

                        it("should execute the callback at the appropriate time", function (done) {
                            var Listeners = {
                                "callback": function () {
                                    expect(Listeners.callback).toHaveBeenCalled();
                                    done();
                                }
                            };

                            spyOn(Listeners, 'callback').and.callThrough();

                            worker = new WebWorker(exampleWorkerUrl);
                            worker[stackId](Listeners.callback);

                            expect(Listeners.callback).not.toHaveBeenCalled();

                            callbackExecutor(worker);
                        });

                        it("should be chainable", function () {
                            var returnValue;

                            worker = new WebWorker(exampleWorkerUrl);
                            returnValue = worker[stackId](function() {});

                            expect(returnValue).toBe(worker);
                        });

                    });
                }

                runCallbackTest('error', function (worker) {
                    worker._workerUrl = '/some-garbage-url';
                    worker.load();
                });

                runCallbackTest('loading', function (worker) {
                    worker.load();
                });

                runCallbackTest('loaded', function (worker) {
                    worker.load();
                });

                runCallbackTest('starting', function (worker) {
                    worker.loaded(function () {
                        worker.start();
                    });

                    worker.load();
                });

                runCallbackTest('started', function (worker) {
                    worker.loaded(function () {
                        worker.start();
                    });
                    worker.load();
                });

                runCallbackTest('terminating', function (worker) {
                    worker.loaded(function () {
                        worker.start();
                    })
                    .started(function () {
                        worker.terminate();
                    });

                    worker.load();
                });

                runCallbackTest('terminated', function (worker) {
                    worker.loaded(function () {
                        worker.start();
                    })
                    .started(function () {
                        worker.terminate();
                    });

                    worker.load();
                });

            });


            describe("constructor", function () {

                it("should accept string selector if first argument is string and if the element exists", function () {
                    worker = new WebWorker(exampleWorkerElemSelector);
                    expect(worker).not.toBe(null);
                });

                it("should accept string URL if first argument is string and an element of same selector does not exist", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker).not.toBe(null);
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
                });

            });


            describe("getBlobUrl", function () {

                it("should return the blob Url once the worker has loaded", function (done) {
                    worker = new WebWorker(exampleWorkerUrl);

                    expect(worker.getBlobUrl()).toBeNull();

                    worker.loaded(function () {
                        expect(worker.getBlobUrl()).not.toBeNull();
                        done();
                    });

                    worker.load();
                });

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
                        },

                        "ERROR2": function (event) {
                            expect(event.message).toEqual(errorMsg2);
                            done();
                        }
                    };

                    worker = new WebWorker(exampleWorkerUrl);

                    expect(worker.getLastError()).toBeNull();

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR1);
                    worker.throwError(errorMsg1);
                });

            });


            describe("getNativeWorker", function () {

                it("should return the native browser worker once it has loaded, null otherwise", function (done) {
                    worker = new WebWorker(exampleWorkerUrl);

                    expect(worker.getNativeWorker()).toBeNull();

                    worker.loaded(function () {
                        var nativeWorker = null;

                        nativeWorker = worker.getNativeWorker();
                        expect(nativeWorker).not.toBeNull();
                        expect(nativeWorker).toEqual(jasmine.any(window.Worker));
                        done();
                    });

                    worker.load();
                });

            });


            describe("getState", function () {

                it("should get the correct current state of the worker", function (done) {
                    worker = new WebWorker(exampleWorkerUrl);

                    expect(worker.getState()).toBe(WebWorkerState.INITIALIZED);

                    worker.loading(function () {
                        expect(worker.getState()).toBe(WebWorkerState.LOADING);
                    })
                    .loaded(function () {
                        expect(worker.getState()).toBe(WebWorkerState.LOADED);
                        worker.start();
                    })
                    .starting(function () {
                        expect(worker.getState()).toBe(WebWorkerState.STARTING);
                    })
                    .started(function () {
                        expect(worker.getState()).toBe(WebWorkerState.STARTED);
                        worker.terminate();
                    })
                    .terminating(function () {
                        expect(worker.getState()).toBe(WebWorkerState.TERMINATING);
                    })
                    .terminated(function () {
                        expect(worker.getState()).toBe(WebWorkerState.TERMINATED);
                        done();
                    });

                    worker.load();
                });

            });


            describe("getUrl", function () {

                it("should return the worker Url", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.getUrl()).toEqual(exampleWorkerUrl);
                });

            });


            describe("isLoaded", function () {

                it("should return true once the worker is loaded, false otherwise", function (done) {
                    worker = new WebWorker(exampleWorkerUrl);

                    expect(worker.isLoaded()).toBe(false);

                    worker.loaded(function () {
                        expect(worker.isLoaded()).toBe(true);
                        done();
                    });

                    worker.load();
                });

            });


            describe("isTerminateInitialized", function () {

                it("should return true when terminate has initialized, false otherwise", function (done) {
                    var Listeners = null;

                    Listeners = {
                        "LOADED": function (event) {
                            worker.terminate();
                        },

                        "TERMINATING": function (event) {
                            expect(worker.isTerminateInitialized()).toBe(true);
                            done();
                        }
                    };

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.loaded(Listeners.LOADED)
                          .terminating(Listeners.TERMINATING);

                    expect(worker.isTerminateInitialized()).toBe(false);

                    worker.load();
                });

            });


            describe("load", function () {

                it("should trigger the WORKER_LOADING event when called", function (done) {
                    var Listeners = {
                        "WORKER_LOADING": function () {
                            expect(Listeners.WORKER_LOADING).toHaveBeenCalled();
                            done();
                        }
                    };

                    spyOn(Listeners, 'WORKER_LOADING').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_LOADING, Listeners.WORKER_LOADING);

                    worker.load();
                });

                it("should trigger the WORKER_LOADED event once the worker has loaded", function (done) {
                    var Listeners = {
                        "WORKER_LOADED": function () {
                            expect(Listeners.WORKER_LOADED).toHaveBeenCalled();
                            done();
                        }
                    };

                    spyOn(Listeners, 'WORKER_LOADED').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.WORKER_LOADED);

                    worker.load();
                });

                it("should trigger the error WORKER_DID_NOT_LOAD if the worker URL could not be loaded", function (done) {
                    var Listeners = null;

                    Listeners = {
                        "LOADED": function (event) {},

                        "ERROR": function (event) {
                            expect(Listeners.LOADED).not.toHaveBeenCalled();
                            expect(Listeners.ERROR).toHaveBeenCalled();
                            expect(event.message).toEqual(WebWorker.Error.WORKER_DID_NOT_LOAD);
                            done();
                        }
                    };

                    spyOn(Listeners, 'LOADED').and.callThrough();
                    spyOn(Listeners, 'ERROR').and.callThrough();

                    worker = new WebWorker('/some-garbage-url');

                    worker.on(WebWorkerEvent.WORKER_LOADED, Listeners.LOADED);
                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR);

                    worker.load();
                });

                it("should be able to load pre-defined script elements", function (done) {
                    var Listeners = null;

                    Listeners = {
                        "LOADED": function (event) {
                            expect(Listeners.LOADED).toHaveBeenCalled();
                            done();
                        }
                    };

                    spyOn(Listeners, 'LOADED').and.callThrough();

                    worker = new WebWorker(exampleWorkerElemSelector);

                    worker.loaded(Listeners.LOADED);

                    worker.load();
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.load()).toEqual(worker);
                });

            });


            describe("message event bus", function () {

                it("should trigger custom events", function (done) {
                    var Listeners = {
                        "ping": function () {
                            expect(Listeners.ping).toHaveBeenCalled();
                            done();
                        }
                    };

                    spyOn(Listeners, 'ping').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.loaded(function () {
                        worker.start();
                    })
                    .started(function () {
                        expect(Listeners.ping).not.toHaveBeenCalled();
                        worker.trigger('ping');
                    })
                    .on('ping', Listeners.ping);

                    worker.load();
                });

            });


            describe("off", function () {

                it("should be able to unbind events", function (done) {
                    var Listeners = null,
                        isCalledOnce = false;

                    Listeners = {
                        "ERROR1": function (event) {},

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
                        }
                    };

                    spyOn(Listeners, 'ERROR1').and.callThrough();
                    spyOn(Listeners, 'ERROR2').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR1);
                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR2);

                    worker.throwError();
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.off()).toEqual(worker);
                });

            });


            describe("on", function () {

                it("should be able to bind events", function (done) {
                    var Listeners = null;

                    Listeners = {
                        "ERROR": function (event) {
                            expect(Listeners.ERROR).toHaveBeenCalled();
                            done();
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
                });

            });


            describe("one", function () {

                it("should be able to bind events for execution only once", function (done) {
                    var Listeners = null,
                        isCalledOnce = false;

                    Listeners = {
                        "ERROR1": function (event) {},

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
                        }
                    };

                    spyOn(Listeners, 'ERROR1').and.callThrough();
                    spyOn(Listeners, 'ERROR2').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.one(WebWorkerEvent.ERROR, Listeners.ERROR1);
                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR2);

                    worker.throwError();
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.one()).toEqual(worker);
                });

            });


            describe("sendMessage", function () {

                it("should be able to send messages to the native worker with the pre-defined protocol", function (done) {
                    var Listeners = null,
                        nativeWorker = null,
                        testMethodName = 'testMethod',
                        testArgs = [1, 2, 3];

                    Listeners = {
                        "LOADED": function (event) {
                            nativeWorker = worker.getNativeWorker();

                            spyOn(nativeWorker, 'postMessage').and.callFake(Listeners.POST_MESSAGE);

                            worker.sendMessage(testMethodName, testArgs);
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
                        }
                    };

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.loaded(Listeners.LOADED);

                    worker.load();
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.sendMessage()).toEqual(worker);
                });

            });


            describe("start", function () {

                it("should trigger the WORKER_STARTING event when called", function (done) {
                    var Listeners = {
                        "WORKER_LOADED": function () {
                            worker.start();
                        },
                        "WORKER_STARTING": function () {
                            expect(Listeners.WORKER_STARTING).toHaveBeenCalled();
                            done();
                        }
                    };

                    spyOn(Listeners, 'WORKER_STARTING').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.loaded(Listeners.WORKER_LOADED);

                    worker.on(WebWorkerEvent.WORKER_STARTING, Listeners.WORKER_STARTING);

                    worker.load();
                });

                it("should trigger the WORKER_STARTED event once the worker has started", function (done) {
                    var Listeners = {
                        "WORKER_LOADED": function () {
                            worker.start();
                        },
                        "WORKER_STARTED": function () {
                            expect(Listeners.WORKER_STARTED).toHaveBeenCalled();
                            done();
                        }
                    };

                    spyOn(Listeners, 'WORKER_STARTED').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.loaded(Listeners.WORKER_LOADED);

                    worker.on(WebWorker.Event.WORKER_STARTED, Listeners.WORKER_STARTED);

                    worker.load();
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.start()).toEqual(worker);
                });

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
                    }

                    Listeners = {
                        "LOADED": function (event) {
                            setTimeout(function () {
                                worker.terminate();
                                isTerminateCalled = true;
                                checkAndComplete();
                            }, 100);
                        },

                        "TERMINATING": function (event) {
                            isEventCalled = true;
                            checkAndComplete();
                        }
                    };

                    worker = new WebWorker(exampleWorkerUrl);

                    spyOn(worker, 'sendMessage').and.callThrough();
                    spyOn(Listeners, 'TERMINATING').and.callThrough();

                    worker.loaded(Listeners.LOADED);

                    worker.on(WebWorkerEvent.WORKER_TERMINATING, Listeners.TERMINATING);

                    worker.load();
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.terminate()).toEqual(worker);
                });

            });


            describe("terminateNow", function () {

                it("should trigger the WORKER_TERMINATING and WORKER_TERMINATED events and terminate the worker immediately", function (done) {
                    var Listeners = null;

                    Listeners = {
                        "LOADED": function (event) {
                            worker.terminateNow();
                        },

                        "TERMINATING": function (event) {},

                        "TERMINATED": function (event) {
                            expect(Listeners.TERMINATING).toHaveBeenCalled();
                            expect(Listeners.TERMINATED).toHaveBeenCalled();
                            expect(worker.sendMessage).not.toHaveBeenCalled();
                            expect(worker.getNativeWorker()).toBeNull();

                            done();
                        }
                    };

                    spyOn(Listeners, 'TERMINATING').and.callThrough();
                    spyOn(Listeners, 'TERMINATED').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    spyOn(worker, 'sendMessage').and.callThrough();
                    worker.loaded(Listeners.LOADED);

                    worker.on(WebWorkerEvent.WORKER_TERMINATING, Listeners.TERMINATING)
                          .on(WebWorkerEvent.WORKER_TERMINATED, Listeners.TERMINATED);

                    worker.load();
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.terminateNow()).toEqual(worker);
                });

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
                        }
                    };

                    spyOn(Listeners, 'ERROR').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR);

                    worker.throwError(errorMsg);
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
                        }
                    };

                    spyOn(Listeners, 'ERROR').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR);

                    worker.throwError(errorMsg, data);
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
                });

                it("should be able to handle objects", function (done) {
                    var error = null,
                        Listeners = null;

                    error = new Error("This is an error!");
                    Listeners = {
                        "ERROR": function (event) {
                            expect(Listeners.ERROR).toHaveBeenCalled();
                            expect(event.message.message).toEqual(error.message);
                            done();
                        }
                    };

                    spyOn(Listeners, 'ERROR').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.on(WebWorkerEvent.ERROR, Listeners.ERROR);

                    worker.throwError(error);
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.throwError()).toEqual(worker);
                });

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
                        },

                        "INITIALIZED": function (event) {
                            expect(Listeners.INITIALIZED).toHaveBeenCalled();
                            expect(Listeners.POST_MESSAGE).not.toHaveBeenCalled();
                        },

                        "SOME_EVENT": function (event) {},

                        "POST_MESSAGE": function (data) {
                            expect(Listeners.SOME_EVENT).not.toHaveBeenCalled();
                            expect(Listeners.POST_MESSAGE).toHaveBeenCalled();

                            done();
                        }
                    };

                    spyOn(Listeners, 'INITIALIZED').and.callThrough();
                    spyOn(Listeners, 'SOME_EVENT').and.callThrough();
                    spyOn(Listeners, 'POST_MESSAGE').and.callThrough();

                    eventType1 = WebWorkerEvent.INITIALIZED;
                    eventType2 = 'some-event';

                    worker = new WebWorker(exampleWorkerUrl);

                    worker.loaded(Listeners.LOADED);

                    worker.on(eventType1, Listeners.INITIALIZED)
                          .on(eventType2, Listeners.SOME_EVENT);

                    worker.load();
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.trigger()).toEqual(worker);
                });

            });


            describe("triggerSelf", function () {

                it("should be able to trigger any event on the worker instance", function (done) {
                    var someEventType = null,
                        Listeners = null;

                    Listeners = {
                        "INITIALIZED": function (event) {
                            expect(Listeners.INITIALIZED).toHaveBeenCalled();
                        },

                        "SOME_EVENT": function (event) {
                            expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                            done();
                        }
                    };

                    spyOn(Listeners, 'INITIALIZED').and.callThrough();
                    spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                    worker = new WebWorker(exampleWorkerUrl);

                    someEventType = 'some-event';

                    worker.on(WebWorkerEvent.INITIALIZED, Listeners.INITIALIZED)
                          .on(someEventType, Listeners.SOME_EVENT);

                    worker.triggerSelf(WebWorkerEvent.INITIALIZED)
                          .triggerSelf(someEventType, null);
                });

                it("should be chainable", function () {
                    worker = new WebWorker(exampleWorkerUrl);
                    expect(worker.triggerSelf()).toEqual(worker);
                });

            });

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
                });

            });


            describe("noConflict", function () {

                var cachedWebWorker = window.WebWorker;

                afterEach(function () {
                    window.WebWorker = cachedWebWorker;
                });

                it("should be able to remove WebWorker from the window object and re-insert into the context and classname provided", function () {
                    var someContext = {},
                        someClassName = 'someClass',
                        returnValue = null;

                    expect(window.WebWorker).toBeDefined();

                    returnValue = WebWorker.noConflict(someContext, someClassName);

                    expect(someContext[someClassName]).toBeDefined();
                    expect(returnValue).not.toBeNull();
                });

                it("should be able to remove WebWorker from the window object even if context and classname are not provided", function () {
                    var returnValue = null;

                    expect(window.WebWorker).toBeDefined();

                    returnValue = WebWorker.noConflict();

                    expect(returnValue).not.toBeNull();
                });

            });

        });

    });


    describe("message listener", function () {

        it("should call the specified action method with the given args", function (done) {
            var nativeWorker = null,
                $nativeWorker = null,
                fakeEvent = null,
                fakeAction = null,
                fakeEventArgs = null,
                Listeners = null;

            Listeners = {
                "LOADED": function () {
                    nativeWorker = worker.getNativeWorker();
                    $nativeWorker = $(nativeWorker);
                    $nativeWorker.on('message', Listeners.MESSAGE);

                    nativeWorker.dispatchEvent(fakeEvent);
                },

                "MESSAGE": function (event) {
                    expect(Listeners.MESSAGE).toHaveBeenCalled();

                    expect(worker[fakeAction]).toHaveBeenCalled();
                    expect(worker[fakeAction].calls.mostRecent().args).toEqual(fakeEventArgs);

                    done();
                }
            };

            fakeAction = 'start';
            fakeEventArgs = [1, 2, 3];

            fakeEvent = new Event("message");

            fakeEvent.data = {
                "__isWebWorkerMsg": true,
                "action": fakeAction,
                "args": fakeEventArgs
            };

            worker = new WebWorker(exampleWorkerUrl);

            spyOn(worker, fakeAction);
            spyOn(Listeners, 'MESSAGE').and.callThrough();

            worker.loaded(Listeners.LOADED);
            worker.load();
        });

        it("should NOT call the specified action method if it is NOT triggered by a WebWorker action", function (done) {
            var nativeWorker = null,
                $nativeWorker = null,
                fakeEvent = null,
                fakeAction = null,
                fakeEventArgs = null,
                Listeners = null;

            Listeners = {
                "LOADED": function () {
                    nativeWorker = worker.getNativeWorker();
                    $nativeWorker = $(nativeWorker);
                    $nativeWorker.on('message', Listeners.MESSAGE);

                    nativeWorker.dispatchEvent(fakeEvent);
                },

                "MESSAGE": function (event) {
                    expect(Listeners.MESSAGE).toHaveBeenCalled();
                    expect(worker[fakeAction]).not.toHaveBeenCalled();

                    done();
                }
            };

            fakeAction = 'start';
            fakeEventArgs = [1, 2, 3];

            fakeEvent = new Event("message");

            fakeEvent.data = {
                "action": fakeAction,
                "args": fakeEventArgs
            };

            worker = new WebWorker(exampleWorkerUrl);

            spyOn(worker, fakeAction);
            spyOn(Listeners, 'MESSAGE').and.callThrough();

            worker.loaded(Listeners.LOADED);
            worker.load();
        });

    });


    describe("error listener", function () {

        it("should trigger an error when an error is captured from within the worker", function (done) {
            var nativeWorker = null,
                $nativeWorker = null,
                fakeEvent = null,
                Listeners = null;

            Listeners = {
                "LOADED": function () {
                    nativeWorker = worker.getNativeWorker();
                    $nativeWorker = $(nativeWorker);
                    $nativeWorker.on('error', Listeners.ERROR);

                    $nativeWorker.trigger(fakeEvent);
                },

                "ERROR": function (event) {
                    event = event.originalEvent || event;

                    expect(Listeners.ERROR).toHaveBeenCalled();

                    expect(event.data).toEqual(fakeEvent.originalEvent.data);

                    done();
                }
            };

            fakeEvent = new $.Event("error");
            fakeEvent.originalEvent = {
                "type": 'error',
                "data": 'some-data'
            };

            worker = new WebWorker(exampleWorkerUrl);

            spyOn(Listeners, 'ERROR').and.callThrough();

            worker.loaded(Listeners.LOADED);
            worker.load();
        });

    });


})();
