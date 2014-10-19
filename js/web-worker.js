(function () {
    'use strict';

    var WebWorker = null,
        BrowserWorker = null,

        context = null,
        className = null,

        defaultContext = window,
        defaultClassName = 'WebWorker',

        Event = null,
        Error = null;

    
    context = context || defaultContext;
    className = className || defaultClassName;

    WebWorker = context[className] || null;

    if (WebWorker !== null) {
        return;
    }

    BrowserWorker = window.Worker;

    WebWorker = function () {
        this._constructor(arguments);
        return;
    };

    WebWorker.prototype._workerUrl = null;
    WebWorker.prototype._worker = null;

    WebWorker.prototype._constructor = function (opts) {
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

        this._workerUrl = workerUrl;
        this._createWorker();

        return;
    };

    WebWorker.prototype.getUrl = function () {
        return this._workerUrl;
    };

    WebWorker.prototype._createWorker = function () {
        this._worker = new BrowserWorker(this._workerUrl);
        return;
    };

    WebWorker.prototype.throwError = function (error) {
        throw new Error(error);
        return;
    };



    WebWorker.throwError = WebWorker.prototype.throwError;

    Error = {
        UNKNOWN: "An unknown error occured.",
        INVALID_ARGUMENTS: "Invalid arguments were supplied to this method. Please check the documentation on the supported arguments for this method."
    };
    WebWorker.Error = Error;

    WebWorker.noConflict = function (context, className) {
        context = context || defaultContext;
        className = className || defaultClassName;

        context[className] = WebWorker;

        return WebWorker;
    };

    WebWorker.noConflict(context, className);

    return;
})();