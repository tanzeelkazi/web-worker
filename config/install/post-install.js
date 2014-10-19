(function () {
    'use strict';
    
    var os = null,
        fse = null,
        cliColor = null,
        exec = null,
        AdmZip = null,

        label = 'Post-install time taken',
        EOL = null,
        ok = null,
        error = null,
        warn = null,
        notice = null,
            
        bowerDir = null,
        libsDir = null,

        jQuerySourceDir = null,
        jQueryDestDir = null,
        
        jasmineSourceArchivePath = null,
        jasmineSourceArchive = null,
        jasmineSourceDir = null,
        jasmineDestDir = null;

    console.time(label);

    os = require('os');
    fse = require('fs-extra');
    cliColor = require('cli-color');
    exec = require('child_process').exec;
    AdmZip = require('adm-zip');

    EOL = os.EOL;

    ok = cliColor.green.bold;
    error = cliColor.red.bold;
    warn = cliColor.yellow,
    notice = cliColor.blue;
    
    bowerDir = './bower_components';
    libsDir = './libs';

    jQuerySourceDir = bowerDir + '/jquery/dist';
    jQueryDestDir = libsDir + '/jquery';

    jasmineSourceArchivePath = bowerDir + '/jasmine/dist/jasmine-standalone-2.0.3.zip';
    jasmineSourceDir = 'lib/jasmine-2.0.3/';
    jasmineDestDir = libsDir + '/jasmine';

    console.log('==================================' + EOL +
                '= TKWorker npm post-install script =' + EOL +
                '==================================' + EOL);

    console.log('Start cleaning directories for install' + EOL);

    console.log('Deleting `bower_components/`...');
    fse.remove(bowerDir);
    console.log(ok('Done' + EOL));

    console.log('Deleting `libs/`...');
    fse.remove(libsDir);
    console.log(ok('Done' + EOL));

    console.log('Directory cleaning completed!' + EOL);


    console.log('Running `bower install`...');
    exec('call node node_modules/bower/bin/bower install -s', function () {
        console.log(ok('Done' + EOL));

        console.log('Start copying resources to `' + libsDir + '/`' + EOL);

        console.log('Copying `jQuery`...');
        fse.mkdirsSync(jQueryDestDir);
        fse.copySync(jQuerySourceDir + '/jquery.js', jQueryDestDir + '/jquery.js');
        console.log(ok('Done' + EOL));

        console.log('Extracting `jasmine-2.0.3` distribution package...');
        fse.mkdirsSync(jasmineDestDir);
        jasmineSourceArchive = new AdmZip(jasmineSourceArchivePath);
        jasmineSourceArchive.extractAllTo(jasmineDestDir, true);
        console.log(ok('Done' + EOL));

        console.timeEnd(label);
        return;
    });

    return;
})();