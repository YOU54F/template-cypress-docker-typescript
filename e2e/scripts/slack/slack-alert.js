const fs = require('fs');
const path = require('path');
const combine = require('../combine.js');
const {
    IncomingWebhook
} = require('@slack/client');
const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);
const templateBuildFail = require('./templateBuildFail.json')
const templateTestFail = require('./templateTestFail.json')
const templateTestPass = require('./templateTestPass.json')
// let REPORT_LOCATION="~/app/e2e/mochareports"
// let REPORT_LOCATION_JUNIT="~/app/e2e/cypress/reports/junit"   
// let VIDEO_LOCATION="~/app/e2e/cypress/videos/"
// let SCREENSHOT_LOCATION="~/app/e2e/cypress/screenshots/" 
// let REPORT_ARTEFACT_URL="https://circleci.com/api/v1.1/project/github/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/${CIRCLE_BUILD_NUM}/artifacts/0"
// let GIT_COMMIT_URL="https://github.com/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commit/${CIRCLE_SHA1}"
const reportStats = getTestReportStatus()
TOTAL_DURATION = reportStats.totalDuration
TOTAL_TESTS = reportStats.totalTests
TOTAL_SUITES = reportStats.totalSuites
TOTAL_FAILURES = reportStats.totalFailures
TOTAL_PASSES = reportStats.totalPasses

messageSelector();

function messageSelector() {
    if (TOTAL_TESTS === undefined || TOTAL_TESTS === 0) {
        sendMessage(templateBuildFail)
    } else if (TOTAL_FAILURES > 0 || TOTAL_PASSES === 0) {
        sendMessage(templateTestFail)
    } else if (TOTAL_FAILURES === 0) {
        sendMessage(templateTestPass)
    }
}

function sendMessage(template) {
    webhook.send(template, function (err, res) {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('message sent: ', res);
        }
    });
}

function getTestReportStatus() {
    const reportDir = path.join(__dirname, '..', '..', 'mochareports');
    const reportFile = combine.getFiles(reportDir, '.json', []);
    // console.log(reportFile[0])
    const rawdata = fs.readFileSync(reportFile[0]);
    const parsedData = JSON.parse(rawdata);
    const reportStats = parsedData.stats
    totalSuites = parsedData.stats.suites
    totalTests = parsedData.stats.tests
    totalPasses = parsedData.stats.passes
    totalFailures = parsedData.stats.failures
    totalDuration = parsedData.stats.duration
    return {
        totalSuites,
        totalTests,
        totalPasses,
        totalFailures,
        totalDuration
    };
}