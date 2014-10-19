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