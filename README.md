#Web Worker

The right way to communicate with your web workers.

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


## Requirements
Production use requirements are `jQuery 1.9+`.

If you are into developing on the project then you need to have at least `Node.js` installed.
The project has a `setup.sh` file (`setup.bat` for Windows users) that will set up the project
dependencies for you and run the post-install script. Isn't that the easiest way to get set
up!


## Browser support
The following list of browsers are known to be supported at this time.

- Chrome
- Firefox
- Safari
- Internet Explorer 11+
