const {IncomingWebhook} = require('@slack/client');
const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);
const templateBuildFail = require('./templateBuildFail.json')
const templateTestFail = require('./templateTestFail.json')
const templateTestPass = require('./templateTestPass.json')
let REPORT_LOCATION="~/app/e2e/mochareports"
let REPORT_LOCATION_JUNIT="~/app/e2e/cypress/reports/junit"   
let VIDEO_LOCATION="~/app/e2e/cypress/videos/"
let SCREENSHOT_LOCATION="~/app/e2e/cypress/screenshots/" 
let REPORT_ARTEFACT_URL="https://circleci.com/api/v1.1/project/github/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/${CIRCLE_BUILD_NUM}/artifacts/0"
let GIT_COMMIT_URL="https://github.com/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commit/${CIRCLE_SHA1}"
let TOTAL_TESTS = 1
let TOTAL_TESTS_FAILING = 0
let TOTAL_TESTS_PASSING = 1
messageSelector(); 
function messageSelector() {
    if (TOTAL_TESTS === undefined) {
        sendMessage(templateBuildFail)
    } else if (TOTAL_TESTS_FAILING > 0 || TOTAL_TESTS_PASSING === 0 ) {
        sendMessage(templateTestFail)
    } else if (TOTAL_TESTS_FAILING === 0) {
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

