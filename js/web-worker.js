(function () {
    'use strict';

    var TKWorker = null,
        WebWorker = null,

        context = null,
        className = null,

        defaultContext = window,
        defaultClassName = 'TKWorker',

        Event = null;
        Error = null;

    context = context || defaultContext;
    className = className || defaultClassName;

    TKWorker = context[className] || null;

    if (TKWorker !== null) {
        return;
    }

    TKWorker = function () {
        this._constructor(arguments);
        return;
    };

    TKWorker.prototype._worker = null;

    TKWorker.prototype._constructor = function (opts) {
        var $scriptElement = null,
            blob = null,
            workerUrl = null;

        opts = opts || null;

        if (opts === null) {
            this.throwError(Error.INVALID_ARGUMENTS);
            return;
        }

        if (typeof opts === 'string') {
            $scriptElement = $(opts);

            if ($scriptElement.length > 0) {
                // Matching script element found
                // Create a blob URL with its contents
                blob = new Blob([$scriptElement.text()], { type: "text/javascript" });
                workerUrl = window.URL.createObjectURL(blob);
            }
            else {
                this.throwError(Error.UNKNOWN);
            }
        }

        return;
    };

    TKWorker.prototype._createWorker = function () {
        this._worker = new Work
        return;
    };

    TKWorker.prototype.throwError = function (error) {
        throw new Error(error);
        return;
    };



    TKWorker.throwError = TKWorker.prototype.throwError;

    Error = {
        UNKNOWN: "An unknown error occured.",
        INVALID_ARGUMENTS: "Invalid arguments were supplied to this method. Please check the documentation on the supported arguments for this method."
    };
    TKWorker.Error = Error;

    TKWorker.noConflict = function (context, className) {
        context = context || defaultContext;
        className = className || defaultClassName;

        context[className] = TKWorker;

        return TKWorker;
    };

    TKWorker.noConflict(context, className);

    return;
})();