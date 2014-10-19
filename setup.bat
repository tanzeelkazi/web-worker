@echo off

@cls

@echo ==========================
@echo = TKWorker project setup =
@echo ==========================

@echo.
@echo Deleting `node_modules` directory...
@rmdir /S /Q node_modules
@echo Done
@echo.


@echo.
@echo Initiating setup with `npm install`...
@echo.

@call npm install --silent

@echo.
@echo TKWorker setup complete
@echo.

@echo on