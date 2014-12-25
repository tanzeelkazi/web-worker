![WebWorker logo](https://raw.githubusercontent.com/tanzeelkazi/webworker/master/img/webworker-logo-128.png)
# WebWorker

Version: 1.0.0a

Event driven web worker javascript framework.

Don't you just hate having only the `postMessage` API to communicate with your workers?
Does it leave you wanting for more and distract you away from actual development
and keep you busy around the communication between the worker and the page? EXACTLY!

The `WebWorker` API enables you to communicate with your workers using an event-based
trigger-listener model. Your worker can trigger any event from within itself and the base
page worker instance listener will be triggered with the event data.
Now isn't _that_ just how it should be done!

The `WebWorker` class is a wrapper for the existing native `Worker` browser API. I created this project
because the native worker communication of using ONLY `postMessage` left me wanting for more.
Instead of working on the worker logic itself I found myself creating a whole communications
channel between the worker and the base page every time I wanted to set up a new worker.


## Getting started
Getting started is very simple. Just drag-drop the `src/js/web-worker.js` file into your project and you
are ready to go.

## Usage
Following are example usages of the script.

#### Simple usage:
```javascript
var worker = new WebWorker('./worker-script.js');

worker.loaded(function () {
    worker.start();
    ...
    worker.terminate();
});
...
worker.load();
```

#### Using the helpers to quickly define tasks:
```javascript
var worker = new WebWorker('./worker-script.js');
worker  .loading(function () {
            console.log('worker is loading');
        })
        .loaded(function () {
            console.log('worker has loaded');
        })
        .starting(function () {
            console.log('worker is starting');
        })
        .started(function () {
            console.log('worker has started');
        })
        .terminating(function () {
            console.log('worker is terminating');
        })
        .terminated(function () {
            console.log('worker has terminated');
        })
        .error(function () {
            console.log('worker encountered an error');
        });
...
worker.load();
...
worker.start();
...
worker.terminate();
```

#### Attaching events on the worker object:
```javascript
var worker = new WebWorker('./worker-script.js');
worker.on('my-custom-event', function () {
    console.log('custom event triggered!');
});
...
worker.load();
...
worker.start();
```

#### Triggering events from within the worker script:
```javascript
self.trigger('my-custom-event');
```
Triggering events within the worker script triggers the event on the worker object on
the base page.

## Requirements
Production use requirements are `jQuery 1.9+`.

If you are into developing on the project then you need to have at least `Node.js` installed.
The project has a `setup.sh` file (`setup.bat` for Windows users) that will set up the project
dependencies for you and run the post-install script. Isn't that the easiest way to get set
up!


## Browser support
The following list of browsers are known to be supported at this time.

- ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/chrome/chrome_16x16.png) Chrome 38+
- ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/firefox/firefox_16x16.png) Firefox 33+
- ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/safari/safari_16x16.png) Safari 7+
- ![Internet Explorer](https://raw.githubusercontent.com/alrra/browser-logos/master/internet-explorer/internet-explorer_16x16.png) Internet Explorer 11+
