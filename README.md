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


## Features
- Delayed loading
  - Your web-worker scripts are not loaded until you explicitly call `.start()` or `.load()` on the `WebWorker` instance.
- Event-driven API
  - No mystery callback hooks for communication between the page and the web worker.
- Ability to use custom events (freedom from being stuck to the `postMessage` API).
  - Define your own custom events for use from within and/or outside the web worker.
- Concentrate more on doing than communicating
  - No more architecting communication protocols between the thread and the base page. This API lays down that foundation for you.
- Logging support on the instance on the base page as well as from within the worker thread
  - Can't figure out what's breaking inside your worker script? No problem. Although I can't promise you a debugger, you can log from within the worker as simply as doing `self.log(data);` and view the data on the base page on the worker instance using `worker.getLog();`. Easier than struggling with `postMessage` and figuring out the hundreds of calls.


## Getting started
Getting started is very simple. Just drag-drop the `src/js/web-worker.js` file into your project and you
are ready to go.

## Usage
Following are example usages of the script.

#### Simple usage:
```javascript
var worker = new WebWorker('./worker-script.js');

worker.on('my-custom-event', function () {
          ...
      })
      .on('my-custom-complete-event', function () {
          ...
          worker.terminate();
      });
...
worker.start();
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
            ...
            worker.terminate();
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

worker.start();
```

#### Attaching events on the worker object:
```javascript
var worker = new WebWorker('./worker-script.js');
worker.on('my-custom-event', function () {
    console.log('custom event triggered!');
});
...
worker.start();
```

#### Triggering events from within the worker script:
```javascript
self.trigger('my-custom-event');
```
Triggering events within the worker script triggers the event on the worker object on
the base page.

#### Logging:
Within the worker script you can log with:
```javascript
self.log('worker data');
```
The data will be logged within the worker instance on the base page for easy viewing/debugging.

On the worker instance on the base page, you can still log data.
```javascript
worker.log('data on base page');
```
All logged data can be retrieved with the `getLog()` method that returns an array of logged items.
```javascript
var logData = worker.getLog(); // logData = ['worker data', 'data on base page']
```


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
