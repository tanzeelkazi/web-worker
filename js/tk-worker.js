(function (context, className) {
    'use strict';

    var TKWorker = null,

        defaultContext = window,
        defaultClassName = 'TKWorker',

        Errors = null;

    context = context || defaultContext;
    className = className || defaultClassName;

    TKWorker = context[className] || null;

    if (TKWorker !== null) {
        return;
    }

    TKWorker = function () {
        return;
    };

    Errors = {
        INVALID_ARGUMENTS: "Invalid arguments supplied to this function"
    };
    TKWorker.Errors = Errors;

    TKWorker.noConflict = function (context, className) {
        context = context || defaultContext;
        className = className || defaultClassName;

        context[className] = TKWorker;

        return TKWorker;
    };

    TKWorker.noConflict(context, className);

    return;
})(window, 'TKWorker');