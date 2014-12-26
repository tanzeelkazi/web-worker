@echo off

@call node ./node_modules/yuidocjs/lib/cli.js -c config/docs/yuidoc.json --no-code --themedir config/docs/theme

@echo on
