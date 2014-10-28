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

    function runPostMessageExpectation(spy, action, args, callIndex) {
        var call = null,
            data = null,
            dataArgs = null,
            i = 0;

        callIndex = typeof callIndex === 'undefined' ? null : callIndex;

        expect(spy).toHaveBeenCalled();

        if (callIndex === null) {
            call = spy.calls.mostRecent();
        } else {
            call = spy.calls.all()[callIndex];
        }

        data = call.args[0];
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

            it("should have the close method", function () {
                expect(typeof WorkerWrapperSandbox.close).toEqual('function');
                return;
            });

            return;
        });

        describe("loading the worker", function () {

            it("should send the trigger WORKER_LOADED to the base worker instance", function () {

                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.loadWorker();

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TRIGGER, [WebWorkerEvent.WORKER_LOADED]);

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

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TRIGGER, [WebWorkerEvent.WORKER_LOADED]);

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

            afterEach(function () {
                WorkerWrapperSandbox.off();
                return;
            });

            it("should be able to selectively remove event listeners", function (done) {
                var Listeners = null,
                    eventType = null,
                    checkExpectation = false;

                Listeners = {
                    "SOME_FN": function () {
                        return;
                    },

                    "ANOTHER_FN": function () {
                        if (checkExpectation) {
                            expect(Listeners.SOME_FN).toHaveBeenCalled();
                            expect(Listeners.ANOTHER_FN).toHaveBeenCalled();

                            expect(Listeners.SOME_FN.calls.count()).toEqual(1);
                            expect(Listeners.ANOTHER_FN.calls.count()).toEqual(2);

                            done();
                            return;
                        }

                        WorkerWrapperSandbox.off(eventType, Listeners.SOME_FN);
                        checkExpectation = true;
                        WorkerWrapperSandbox.triggerSelf(eventType);
                        return;
                    }
                };

                spyOn(Listeners, 'SOME_FN').and.callThrough();
                spyOn(Listeners, 'ANOTHER_FN').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, Listeners.SOME_FN);
                WorkerWrapperSandbox.on(eventType, Listeners.ANOTHER_FN);

                WorkerWrapperSandbox.triggerSelf(eventType);

                return;
            });

            it("should be able to remove all listeners for a particular event type", function (done) {
                var Listeners = null,
                    eventType1 = null,
                    eventType2 = null,
                    checkExpectation = false;

                Listeners = {
                    "SOME_FN": function () {
                        return;
                    },

                    "ANOTHER_FN": function () {
                        if (checkExpectation) {
                            expect(Listeners.SOME_FN).toHaveBeenCalled();
                            expect(Listeners.ANOTHER_FN).toHaveBeenCalled();

                            expect(Listeners.SOME_FN.calls.count()).toEqual(1);
                            expect(Listeners.ANOTHER_FN.calls.count()).toEqual(2);

                            done();
                            return;
                        }

                        WorkerWrapperSandbox.off(eventType1);
                        checkExpectation = true;
                        WorkerWrapperSandbox.triggerSelf(eventType1);
                        WorkerWrapperSandbox.triggerSelf(eventType2);
                        return;
                    }
                };

                spyOn(Listeners, 'SOME_FN').and.callThrough();
                spyOn(Listeners, 'ANOTHER_FN').and.callThrough();

                eventType1 = 'some-event';
                eventType2 = 'some-other-event';

                WorkerWrapperSandbox.on(eventType1, Listeners.SOME_FN);
                WorkerWrapperSandbox.on(eventType2, Listeners.ANOTHER_FN);

                WorkerWrapperSandbox.triggerSelf(eventType1);
                WorkerWrapperSandbox.triggerSelf(eventType2);
                return;
            });

            it("should be able to remove all listeners on the object", function (done) {
                var Listeners = null,
                    eventType1 = null,
                    eventType2 = null,
                    eventType3 = null;

                Listeners = {
                    "FN1": function () {
                        return;
                    },

                    "FN2": function () {
                        expect(Listeners.FN1).toHaveBeenCalled();
                        expect(Listeners.FN2).toHaveBeenCalled();

                        WorkerWrapperSandbox.off();
                        WorkerWrapperSandbox.on(eventType3, Listeners.FN3);
                        WorkerWrapperSandbox.triggerSelf(eventType3);
                        return;
                    },

                    "FN3": function () {

                        expect(Listeners.FN1.calls.count()).toEqual(1);
                        expect(Listeners.FN2.calls.count()).toEqual(1);
                        expect(Listeners.FN3.calls.count()).toEqual(1);

                        done();
                        return;
                    }
                };

                spyOn(Listeners, 'FN1').and.callThrough();
                spyOn(Listeners, 'FN2').and.callThrough();
                spyOn(Listeners, 'FN3').and.callThrough();

                eventType1 = 'some-event-1';
                eventType2 = 'some-event-2';
                eventType3 = 'some-event-3';

                WorkerWrapperSandbox.on(eventType1, Listeners.FN1);
                WorkerWrapperSandbox.on(eventType2, Listeners.FN2);

                WorkerWrapperSandbox.triggerSelf(eventType1);
                WorkerWrapperSandbox.triggerSelf(eventType2);
                WorkerWrapperSandbox.triggerSelf(eventType3);

                return;
            });

            return;
        });

        describe("on", function () {

            afterEach(function () {
                WorkerWrapperSandbox.off();
                return;
            });

            it("should be able to bind events to the worker", function (done) {
                var Listeners = null,
                    eventType = null;

                Listeners = {
                    "SOME_EVENT": function () {
                        expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                        done();
                        return;
                    }
                };

                spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, Listeners.SOME_EVENT);
                WorkerWrapperSandbox.triggerSelf(eventType);
                return;
            });

            it("should silently fail if the listener passed in is not a function", function (done) {
                var Listeners = null,
                    eventType = null;

                Listeners = {
                    "SOME_EVENT": function () {
                        expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                        done();
                        return;
                    }
                };

                spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, 'random-data');
                WorkerWrapperSandbox.on(eventType, Listeners.SOME_EVENT);
                WorkerWrapperSandbox.triggerSelf(eventType);
                return;
            });

            return;
        });

        describe("one", function () {

            afterEach(function () {
                WorkerWrapperSandbox.off();
                return;
            });

            it("should be able to bind events to the worker for execution only once", function (done) {
                var Listeners = null,
                    eventType = null,
                    checkExpectation = false;

                Listeners = {
                    "SOME_FN": function () {
                        return;
                    },

                    "ANOTHER_FN": function () {
                        if (checkExpectation) {
                            expect(Listeners.SOME_FN).toHaveBeenCalled();
                            expect(Listeners.ANOTHER_FN).toHaveBeenCalled();

                            expect(Listeners.SOME_FN.calls.count()).toEqual(1);
                            expect(Listeners.ANOTHER_FN.calls.count()).toEqual(2);

                            done();
                            return;
                        }

                        checkExpectation = true;
                        WorkerWrapperSandbox.triggerSelf(eventType);
                        return;
                    }
                };

                spyOn(Listeners, 'SOME_FN').and.callThrough();
                spyOn(Listeners, 'ANOTHER_FN').and.callThrough();

                eventType = 'some-other-event';

                WorkerWrapperSandbox.one(eventType, Listeners.SOME_FN);
                WorkerWrapperSandbox.on(eventType, Listeners.ANOTHER_FN);

                WorkerWrapperSandbox.triggerSelf(eventType);
                return;
            });

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

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TRIGGER, [WebWorkerEvent.WORKER_STARTED]);
                return;
            });

            return;
        });

        describe("terminate", function () {

            afterEach(function () {
                WorkerWrapperSandbox._isTerminating = false;
                return;
            });

            it("should set the isTerminating status to true", function () {
                WorkerWrapperSandbox._isTerminating = false;
                expect(WorkerWrapperSandbox.isTerminating()).toBe(false);

                WorkerWrapperSandbox.terminate();

                expect(WorkerWrapperSandbox.isTerminating()).toBe(true);
                return;
            });

            it("should send the WORKER_TERMINATING event and TERMINATE_NOW action to the base worker instance", function () {
                var x;
                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.terminate();

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TRIGGER, [WebWorkerEvent.WORKER_TERMINATING], 0);
                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TERMINATE_NOW, [x]);
                return;
            });

            it("should call the terminateHandler and send the return value with the TERMINATE_NOW action to the base worker instance", function () {
                var stubbedValue = 123;

                WorkerWrapperSandbox.terminateHandler = function () {
                    return stubbedValue;
                };

                spyOn(WorkerWrapperSandbox, 'terminateHandler').and.callThrough();
                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.terminate();

                expect(WorkerWrapperSandbox.terminateHandler).toHaveBeenCalled();

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TERMINATE_NOW, [stubbedValue]);
                return;
            });

            it("should call the native close API if parameter true is passed in", function () {
                spyOn(WorkerWrapperSandbox, '_nativeClose');

                WorkerWrapperSandbox.terminate();

                expect(WorkerWrapperSandbox._nativeClose).not.toHaveBeenCalled();

                WorkerWrapperSandbox.terminate(true);
                expect(WorkerWrapperSandbox._nativeClose).toHaveBeenCalled();
                return;
            });

            return;
        });

        describe("terminateHandler", function () {

            it("should get called when the worker is terminated", function () {
                var stubbedValue = 123;

                WorkerWrapperSandbox.terminateHandler = function () {
                    return stubbedValue;
                };

                spyOn(WorkerWrapperSandbox, 'terminateHandler').and.callThrough();

                WorkerWrapperSandbox.terminate();

                expect(WorkerWrapperSandbox.terminateHandler).toHaveBeenCalled();
                return;
            });

            return;
        });

        describe("terminateNow", function () {

            it("should call the terminate method with parameter true", function () {
                spyOn(WorkerWrapperSandbox, 'terminate');

                WorkerWrapperSandbox.terminateNow();

                expect(WorkerWrapperSandbox.terminate).toHaveBeenCalledWith(true);
                return;
            });

            return;
        });

        describe("trigger", function () {
            return;
        });

        describe("triggerSelf", function () {

            afterEach(function () {
                WorkerWrapperSandbox.off();
                return;
            });

            it("should be able to trigger bound events on the worker", function (done) {
                var Listeners = null,
                    eventType = null;

                Listeners = {
                    "SOME_EVENT": function () {
                        expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                        done();
                        return;
                    }
                };

                spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, Listeners.SOME_EVENT);
                WorkerWrapperSandbox.triggerSelf(eventType);
                return;
            });

            it("should be able to handle event objects", function (done) {
                var Listeners = null,
                    eventType = null;

                Listeners = {
                    "SOME_EVENT": function () {
                        expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                        done();
                        return;
                    }
                };

                spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, Listeners.SOME_EVENT);
                WorkerWrapperSandbox.triggerSelf({
                    "type": eventType,
                    "data": 'some-data'
                });

                return;
            });

            it("should fail silently if no event type is passed in or is garbage", function (done) {
                var Listeners = null,
                    eventType1 = null,
                    eventType2 = null,
                    checkExpectation = false;

                Listeners = {
                    "SOME_FN": function () {
                        return;
                    },

                    "ANOTHER_FN": function () {
                        if (checkExpectation) {
                            expect(Listeners.SOME_FN).not.toHaveBeenCalled();
                            expect(Listeners.ANOTHER_FN).toHaveBeenCalled();

                            done();
                            return;
                        }

                        WorkerWrapperSandbox.off(eventType1);
                        checkExpectation = true;
                        WorkerWrapperSandbox.triggerSelf(eventType1);
                        WorkerWrapperSandbox.triggerSelf(eventType2);
                        return;
                    }
                };

                spyOn(Listeners, 'SOME_FN').and.callThrough();
                spyOn(Listeners, 'ANOTHER_FN').and.callThrough();

                eventType1 = 'some-event';
                eventType2 = 'some-other-event';

                WorkerWrapperSandbox.on(eventType1, Listeners.SOME_FN);
                WorkerWrapperSandbox.on(eventType2, Listeners.ANOTHER_FN);

                WorkerWrapperSandbox.triggerSelf(null);
                WorkerWrapperSandbox.triggerSelf(true);
                WorkerWrapperSandbox.triggerSelf(eventType2);
                return;
            });

            return;
        });

        return;
    });

    return;
})();
