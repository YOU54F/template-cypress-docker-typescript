const path = require('path');

const uuidv1 = require('uuid/v1');
const rimraf = require('rimraf');
const shell = require('shelljs');


const upload = require('./upload.js');
const combine = require('./combine.js');


    // generate mochawesome report
    const data = combine.combineMochaAwesomeReports();
    const uuid = uuidv1();
    combine.writeReport(data, uuid);
    rimraf(path.join(__dirname, '..', 'cypress/reports/mocha'), () => {});
    shell.exec(`./node_modules/.bin/marge ${uuid}.json  --reportDir mochareports`, (code, stdout, stderr) => {
      if (stderr) throw stderr;
      // upload to s3
      upload.uploadScreenshots();
      upload.uploadVideos();
      upload.uploadMochaAwesome();
      // cleanup
      rimraf(path.join(__dirname, '..', 'cypress/reports/mocha'), () => {});
      rimraf(path.join(__dirname, '..', `${uuid}.json`), () => {});
    });