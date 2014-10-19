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

            it("should accept string selector as first argument if the element exists", function () {
                try {
                    worker = new WebWorker("#test-worker-script-elem");
                }
                catch (err) {
                }

                expect(worker).not.toBe(null);

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