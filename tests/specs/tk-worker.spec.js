(function () {
    'use strict';

    var worker = null;

    describe("TKWorker", function () {

        it("should be defined", function () {
            expect(TKWorker).toBeDefined();
            return;
        });

        describe("instance", function () {
            
            afterEach(function () {
                worker = null;
                return;
            });

            it("should accept string selector as first argument if the element exists", function () {
                try {
                    worker = new TKWorker("#test-worker-script-elem");
                }
                catch (err) {
                }

                expect(worker).not.toBe(null);

                return;
            });

            return;
        });

        describe("TKWorker static", function () {
        });

        return;
    });

    return;
})();