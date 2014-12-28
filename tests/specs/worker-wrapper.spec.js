/*global jasmine:false, WebWorker:false WorkerWrapperSandbox:false */
(function () {
    'use strict';

    var WebWorkerState = null,
        WebWorkerAction = null,
        WebWorkerEvent = null;

    WebWorkerState = WebWorker.State;
    WebWorkerAction = WebWorker.Action;
    WebWorkerEvent = WebWorker.Event;

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
    }


    describe("WorkerWrapper", function () {


        describe("sandbox", function () {

            it("should be defined", function () {
                expect(WorkerWrapperSandbox).toBeDefined();
            });

            it("should have the postMessage method", function () {
                expect(typeof WorkerWrapperSandbox.postMessage).toEqual('function');
            });

            it("should have the addEventListener method", function () {
                expect(typeof WorkerWrapperSandbox.addEventListener).toEqual('function');
            });

            it("should have the onmessage property", function () {
                expect(WorkerWrapperSandbox.onmessage).toBeNull();
            });

            it("should have the loadWorker method", function () {
                expect(typeof WorkerWrapperSandbox.loadWorker).toEqual('function');
            });

            it("should have the close method", function () {
                expect(typeof WorkerWrapperSandbox.close).toEqual('function');
            });

        });


        describe("callback", function () {

            function runCallbackTest(stackId, callbackExecutor) {
                describe(stackId, function () {

                    beforeEach(function () {
                        WorkerWrapperSandbox.loadWorker();
                    });

                    afterEach(function () {
                        WorkerWrapperSandbox._callbackStack[stackId] = [];
                    });

                    it("should take a function as an argument and add it to the callback list", function () {
                        var Listeners = {
                            "callback": function () {}
                        };

                        WorkerWrapperSandbox[stackId](Listeners.callback);

                        expect(WorkerWrapperSandbox._callbackStack[stackId]).toContain(Listeners.callback);
                    });

                    it("should not add non-functions to the callback list", function () {
                        var Listeners = {
                            "callback": {}
                        };

                        WorkerWrapperSandbox[stackId](Listeners.callback);

                        expect(WorkerWrapperSandbox._callbackStack[stackId]).not.toContain(Listeners.callback);
                    });

                    it("should execute the callback at the appropriate time", function (done) {
                        var Listeners = {
                            "callback": function () {
                                expect(Listeners.callback).toHaveBeenCalled();
                                done();
                            }
                        };

                        spyOn(Listeners, 'callback').and.callThrough();

                        WorkerWrapperSandbox[stackId](Listeners.callback);

                        expect(Listeners.callback).not.toHaveBeenCalled();

                        callbackExecutor();
                    });

                    it("should be chainable", function () {
                        var returnValue;

                        returnValue = WorkerWrapperSandbox[stackId](function() {});

                        expect(returnValue).toBe(WorkerWrapperSandbox);
                    });

                });
            }

            runCallbackTest('terminating', function () {
                WorkerWrapperSandbox.terminate();
            });

        });


        describe("loading the worker", function () {

            it("should send the trigger WORKER_LOADED to the base worker instance", function () {
                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.loadWorker();

                expect(WorkerWrapperSandbox.isInitialized()).toBe(true);
                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TRIGGER_SELF, [WebWorkerEvent.WORKER_LOADED]);
            });

        });


        describe("close", function () {

            it("should be an alias for the terminate method", function () {
                expect(WorkerWrapperSandbox.close).toEqual(WorkerWrapperSandbox.terminate);
            });

        });


        describe("isInitialized", function () {

            it("should return true if initialized, false otherwise", function () {
                WorkerWrapperSandbox._state = null;
                expect(WorkerWrapperSandbox.isInitialized()).toBe(false);

                WorkerWrapperSandbox._state = WebWorkerState.INITIALIZED;
                expect(WorkerWrapperSandbox.isInitialized()).toBe(true);

                WorkerWrapperSandbox._state = WebWorkerState.STARTED;
                expect(WorkerWrapperSandbox.isInitialized()).toBe(true);
            });

        });


        describe("isTerminating", function () {

            it("should return true if the worker is terminating, false otherwise", function () {
                WorkerWrapperSandbox._state = WebWorkerState.STARTED;
                expect(WorkerWrapperSandbox.isTerminating()).toBe(false);

                WorkerWrapperSandbox._state = WebWorkerState.TERMINATING;
                expect(WorkerWrapperSandbox.isTerminating()).toBe(true);
            });

        });


        describe("log", function () {

            it("should send the log messages to the base instance", function () {
                var testMsg = 'test msg';

                spyOn(WorkerWrapperSandbox, 'sendMessage');

                expect(WorkerWrapperSandbox.sendMessage).not.toHaveBeenCalled();
                WorkerWrapperSandbox.log(testMsg);

                expect(WorkerWrapperSandbox.sendMessage).toHaveBeenCalledWith('log', [testMsg]);
            });

            it("should be chainable", function () {
                spyOn(WorkerWrapperSandbox, 'sendMessage');
                expect(WorkerWrapperSandbox.log()).toBe(WorkerWrapperSandbox);
            });

        });


        describe("off", function () {

            afterEach(function () {
                WorkerWrapperSandbox.off();
            });

            it("should be able to selectively remove event listeners", function (done) {
                var Listeners = null,
                    eventType = null,
                    checkExpectation = false;

                Listeners = {
                    "SOME_FN": function () {},

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
                    }
                };

                spyOn(Listeners, 'SOME_FN').and.callThrough();
                spyOn(Listeners, 'ANOTHER_FN').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, Listeners.SOME_FN);
                WorkerWrapperSandbox.on(eventType, Listeners.ANOTHER_FN);

                WorkerWrapperSandbox.triggerSelf(eventType);
            });

            it("should be able to remove all listeners for a particular event type", function (done) {
                var Listeners = null,
                    eventType1 = null,
                    eventType2 = null,
                    checkExpectation = false;

                Listeners = {
                    "SOME_FN": function () {},

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
            });

            it("should be able to remove all listeners on the object", function (done) {
                var Listeners = null,
                    eventType1 = null,
                    eventType2 = null,
                    eventType3 = null;

                Listeners = {
                    "FN1": function () {},

                    "FN2": function () {
                        expect(Listeners.FN1).toHaveBeenCalled();
                        expect(Listeners.FN2).toHaveBeenCalled();

                        WorkerWrapperSandbox.off();
                        WorkerWrapperSandbox.on(eventType3, Listeners.FN3);
                        WorkerWrapperSandbox.triggerSelf(eventType3);
                    },

                    "FN3": function () {
                        expect(Listeners.FN1.calls.count()).toEqual(1);
                        expect(Listeners.FN2.calls.count()).toEqual(1);
                        expect(Listeners.FN3.calls.count()).toEqual(1);

                        done();
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
            });

        });


        describe("on", function () {

            afterEach(function () {
                WorkerWrapperSandbox.off();
            });

            it("should be able to bind events to the worker", function (done) {
                var Listeners = null,
                    eventType = null;

                Listeners = {
                    "SOME_EVENT": function () {
                        expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                        done();
                    }
                };

                spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, Listeners.SOME_EVENT);
                WorkerWrapperSandbox.triggerSelf(eventType);
            });

            it("should silently fail if the listener passed in is not a function", function (done) {
                var Listeners = null,
                    eventType = null;

                Listeners = {
                    "SOME_EVENT": function () {
                        expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                        done();
                    }
                };

                spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, 'random-data');
                WorkerWrapperSandbox.on(eventType, Listeners.SOME_EVENT);
                WorkerWrapperSandbox.triggerSelf(eventType);
            });

        });


        describe("one", function () {

            afterEach(function () {
                WorkerWrapperSandbox.off();
            });

            it("should be able to bind events to the worker for execution only once", function (done) {
                var Listeners = null,
                    eventType = null,
                    checkExpectation = false;

                Listeners = {
                    "SOME_FN": function () {},

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
                    }
                };

                spyOn(Listeners, 'SOME_FN').and.callThrough();
                spyOn(Listeners, 'ANOTHER_FN').and.callThrough();

                eventType = 'some-other-event';

                WorkerWrapperSandbox.one(eventType, Listeners.SOME_FN);
                WorkerWrapperSandbox.on(eventType, Listeners.ANOTHER_FN);

                WorkerWrapperSandbox.triggerSelf(eventType);
            });

        });


        describe("sendMessage", function () {

            it("should send the specified action and arguments to the base worker instance", function () {
                var myAction = null,
                    myArgs = null;

                spyOn(WorkerWrapperSandbox, 'postMessage');

                myAction = 'someAction';
                myArgs = ['some-arg'];
                WorkerWrapperSandbox.sendMessage(myAction, myArgs);

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, myAction, myArgs);
            });

            it("should fail silently if no action is provided", function () {
                var myAction = null,
                    myArgs = null;

                spyOn(WorkerWrapperSandbox, 'postMessage');

                myAction = 'someAction';
                myArgs = ['some-arg'];
                WorkerWrapperSandbox.sendMessage(null, myArgs);
                WorkerWrapperSandbox.sendMessage(myAction, myArgs);

                expect(WorkerWrapperSandbox.postMessage.calls.count()).toEqual(1);
                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, myAction, myArgs);
            });

        });


        describe("start", function () {

            afterEach(function () {
                WorkerWrapperSandbox._state = WebWorkerState.INITIALIZED;
            });

            it("should NOT start the worker if it is NOT initialized", function () {
                spyOn(WorkerWrapperSandbox, '_main');

                WorkerWrapperSandbox._state = null;
                WorkerWrapperSandbox.start();

                expect(WorkerWrapperSandbox.isInitialized()).toBe(false);
                expect(WorkerWrapperSandbox._main).not.toHaveBeenCalled();
            });

            it("should start the worker if it is initialized", function () {
                spyOn(WorkerWrapperSandbox, '_main');

                WorkerWrapperSandbox._state = WebWorkerState.INITIALIZED;
                WorkerWrapperSandbox.start();

                expect(WorkerWrapperSandbox.isInitialized()).toBe(true);
                expect(WorkerWrapperSandbox._main).toHaveBeenCalled();
            });

            it("should send the WORKER_STARTED event to the base instance once started", function () {
                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.start();

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TRIGGER_SELF, [WebWorkerEvent.WORKER_STARTED]);
            });

            it("should trigger the WORKER_STARTED event on itself once started", function (done) {
                var Listeners = null;

                Listeners = {
                    "WORKER_STARTED": function () {
                        expect(Listeners.WORKER_STARTED).toHaveBeenCalled();
                        done();
                    }
                };

                spyOn(WorkerWrapperSandbox, 'postMessage');
                spyOn(Listeners, 'WORKER_STARTED').and.callThrough();

                WorkerWrapperSandbox.on(WebWorkerEvent.WORKER_STARTED, Listeners.WORKER_STARTED);

                WorkerWrapperSandbox.start();
            });

        });


        describe("terminate", function () {

            afterEach(function () {
                WorkerWrapperSandbox._state = WebWorkerState.INITIALIZED;
            });

            it("should set the worker into terminating state", function () {
                WorkerWrapperSandbox._state = WebWorkerState.STARTED;
                expect(WorkerWrapperSandbox.isTerminating()).toBe(false);

                WorkerWrapperSandbox.terminate();

                expect(WorkerWrapperSandbox.isTerminating()).toBe(true);
            });

            it("should send the WORKER_TERMINATING event and TERMINATE_NOW action to the base worker instance", function () {
                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.terminate();

                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TRIGGER_SELF, [WebWorkerEvent.WORKER_TERMINATING], 0);
                runPostMessageExpectation(WorkerWrapperSandbox.postMessage, WebWorkerAction.TERMINATE_NOW, []);
            });

            it("should call the native close API if parameter true is passed in", function () {
                spyOn(WorkerWrapperSandbox, '_nativeClose');

                WorkerWrapperSandbox.terminate();

                expect(WorkerWrapperSandbox._nativeClose).not.toHaveBeenCalled();

                WorkerWrapperSandbox.terminate(true);
                expect(WorkerWrapperSandbox._nativeClose).toHaveBeenCalled();
            });

        });


        describe("terminateNow", function () {

            it("should call the terminate method with parameter true", function () {
                spyOn(WorkerWrapperSandbox, 'terminate');

                WorkerWrapperSandbox.terminateNow();

                expect(WorkerWrapperSandbox.terminate).toHaveBeenCalledWith(true);
            });

        });


        describe("trigger", function () {

            afterEach(function () {
                WorkerWrapperSandbox.off();
            });

            it("should be able to send trigger events to the base worker instance", function () {
                var eventType = null,
                    eventData = null,
                    args = null,
                    postMessageArg = null,
                    actionArgs = null,
                    eventArg = null;

                spyOn(WorkerWrapperSandbox, 'postMessage');

                eventType = 'some-event';
                eventData = 'some-data';

                WorkerWrapperSandbox.trigger(eventType, eventData);

                expect(WorkerWrapperSandbox.postMessage).toHaveBeenCalled();

                args = WorkerWrapperSandbox.postMessage.calls.mostRecent().args;

                expect(args.length).toEqual(1);

                postMessageArg = args[0];
                expect(postMessageArg.action).toEqual(WebWorkerAction.TRIGGER_SELF);

                actionArgs = postMessageArg.args;
                eventArg = actionArgs[0];
                expect(eventArg.type).toEqual(eventType);
                expect(eventArg.data).toEqual(eventData);
            });

            it("should be able to handle event objects", function () {
                var eventObj = null,
                    args = null,
                    postMessageArg = null,
                    actionArgs = null,
                    eventArg = null;

                spyOn(WorkerWrapperSandbox, 'postMessage');

                eventObj = {
                    "type": 'some-event',
                    "data": 'some-data'
                };

                WorkerWrapperSandbox.trigger(eventObj);

                expect(WorkerWrapperSandbox.postMessage).toHaveBeenCalled();

                args = WorkerWrapperSandbox.postMessage.calls.mostRecent().args;

                expect(args.length).toEqual(1);

                postMessageArg = args[0];
                expect(postMessageArg.action).toEqual(WebWorkerAction.TRIGGER_SELF);

                actionArgs = postMessageArg.args;
                eventArg = actionArgs[0];
                expect(eventArg.type).toEqual(eventObj.type);
                expect(eventArg.data).toEqual(eventObj.data);
            });

            it("should fail silently if no event type is passed in or is garbage", function () {
                spyOn(WorkerWrapperSandbox, 'postMessage');

                WorkerWrapperSandbox.trigger();
                expect(WorkerWrapperSandbox.postMessage).not.toHaveBeenCalled();

                WorkerWrapperSandbox.trigger(null);
                expect(WorkerWrapperSandbox.postMessage).not.toHaveBeenCalled();

                WorkerWrapperSandbox.trigger({});
                expect(WorkerWrapperSandbox.postMessage).not.toHaveBeenCalled();
            });

        });


        describe("triggerSelf", function () {

            afterEach(function () {
                WorkerWrapperSandbox.off();
            });

            it("should be able to trigger bound events on the worker", function (done) {
                var Listeners = null,
                    eventType = null;

                Listeners = {
                    "SOME_EVENT": function () {
                        expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                        done();
                    }
                };

                spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, Listeners.SOME_EVENT);
                WorkerWrapperSandbox.triggerSelf(eventType);
            });

            it("should be able to handle event objects", function (done) {
                var Listeners = null,
                    eventType = null;

                Listeners = {
                    "SOME_EVENT": function () {
                        expect(Listeners.SOME_EVENT).toHaveBeenCalled();
                        done();
                    }
                };

                spyOn(Listeners, 'SOME_EVENT').and.callThrough();

                eventType = 'some-event';

                WorkerWrapperSandbox.on(eventType, Listeners.SOME_EVENT);
                WorkerWrapperSandbox.triggerSelf({
                    "type": eventType,
                    "data": 'some-data'
                });
            });

            it("should fail silently if no event type is passed in or is garbage", function (done) {
                var Listeners = null,
                    eventType1 = null,
                    eventType2 = null,
                    checkExpectation = false;

                Listeners = {
                    "SOME_FN": function () {},

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
            });

        });


        describe("message listener", function () {

            it("should call the specified action method with the given args", function () {
                var fakeEvent = null,
                    fakeEventArgs = null;

                fakeEventArgs = [1, 2, 3];

                fakeEvent = {
                    "type": "message",
                    "data": {
                        "__isWebWorkerMsg": true,
                        "action": "start",
                        "args": fakeEventArgs
                    }
                };

                spyOn(WorkerWrapperSandbox, 'start');

                WorkerWrapperSandbox.onmessage(fakeEvent);

                expect(WorkerWrapperSandbox.start).toHaveBeenCalled();

                expect(WorkerWrapperSandbox.start.calls.mostRecent().args).toEqual(fakeEventArgs);
            });

            it("should NOT call the specified action method if it is NOT triggered by a WebWorker action", function () {
                var fakeEvent = null,
                    fakeEventArgs = null;

                fakeEventArgs = [1, 2, 3];

                fakeEvent = {
                    "type": "message",
                    "data": {
                        "action": "start",
                        "args": fakeEventArgs
                    }
                };

                spyOn(WorkerWrapperSandbox, 'start');

                WorkerWrapperSandbox.onmessage(fakeEvent);

                expect(WorkerWrapperSandbox.start).not.toHaveBeenCalled();
            });

        });

    });

})();
