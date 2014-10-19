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
        this._constructor.apply(this, arguments);
        return;
    };

    WebWorker.prototype._workerUrl = null;
    WebWorker.prototype._worker = null;
    WebWorker.prototype._lastError = null;

    WebWorker.prototype._constructor = function (opts) {
        var $scriptElement = null,
            scriptContents = null,
            blob = null,
            workerUrl = null;

        opts = opts || null;

        if (opts === null) {
            this.throwError(Error.INVALID_ARGUMENTS);
            return;
        }

        if (typeof opts === 'string') {
            opts = $.trim(opts);
            $scriptElement = $(opts);

            if ($scriptElement.length > 0) {
                // Matching script element found
                // Create a blob URL with its contents
                scriptContents = $scriptElement.text();
                blob = new Blob([scriptContents], { type: "text/javascript" });
                workerUrl = window.URL.createObjectURL(blob);
            }
            else {
                //this.throwError(Error.UNKNOWN);
                workerUrl = opts;
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
        this._lastError = error;
        WebWorker._lastError = error;
        throw new Error(error);
        return;
    };

    WebWorker.prototype.getLastError = function () {
        return this._lastError;
    };


    // Static

    WebWorker._lastError = null;

    Error = {
        UNKNOWN: "An unknown error occured.",
        INVALID_ARGUMENTS: "Invalid arguments were supplied to this method. Please check the documentation on the supported arguments for this method."
    };
    WebWorker.Error = Error;

    WebWorker.throwError = WebWorker.prototype.throwError;

    WebWorker.noConflict = function (context, className) {
        context = context || defaultContext;
        className = className || defaultClassName;

        context[className] = WebWorker;

        return WebWorker;
    };

    WebWorker.noConflict(context, className);

    return;
})();