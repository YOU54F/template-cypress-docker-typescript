const fs = require('fs');
const path = require('path');
const combine = require('../combine.js');
const {
    IncomingWebhook
} = require('@slack/client');
const url = process.env.SLACK_WEBHOOK_URL;
const webhook = new IncomingWebhook(url);
const reportStats = getTestReportStatus()
const TOTAL_DURATION = reportStats.totalDuration
const TOTAL_TESTS = reportStats.totalTests
const TOTAL_SUITES = reportStats.totalSuites
const TOTAL_FAILURES = reportStats.totalFailures
const TOTAL_PASSES = reportStats.totalPasses
const CIRCLE_PROJECT_REPONAME = process.env.CIRCLE_PROJECT_REPONAME;
const CIRCLE_USERNAME = process.env.CIRCLE_USERNAME
const CIRCLE_PROJECT_USERNAME = process.env.CIRCLE_PROJECT_USERNAME
const SLACK_API_CHANNEL = process.env.SLACK_API_CHANNEL
const CIRCLE_BRANCH = process.env.CIRCLE_BRANCH
const CIRCLE_SHA1 = process.env.CIRCLE_SHA1
const CIRCLE_BUILD_URL = process.env.CIRCLE_BUILD_URL
const CIRCLE_BUILD_NUM = process.env.CIRCLE_BUILD_NUM
// const VIDEO_LOCATION = "~/app/e2e/cypress/videos/"
// const SCREENSHOT_LOCATION = "~/app/e2e/cypress/screenshots/"
// const video_attachments_slack = 'video_attachments_slack'
let video_attachments_slack=''
const screenshot_attachments_slack = 'screenshot_attachments_slack'
const VCS_ROOT = 'github' //change to bitbucket, if circleci project hosted on bitbucket
const VCS_BASEURL_GITHUB = 'https://github.com'
const VCS_BASEURL_BITBUCKET = 'https://github.com'
const REPORT_ARTEFACT_URL = `https://circleci.com/api/v1.1/project/${VCS_ROOT}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/${CIRCLE_BUILD_NUM}/artifacts/0`
const GIT_COMMIT_URL = `${VCS_BASEURL_GITHUB}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commit/${CIRCLE_SHA1}`
const BITBUCKET_COMMIT_URL = `${VCS_BASEURL_BITBUCKET}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commits/${CIRCLE_SHA1}`
const reportHTMLUrl = (REPORT_ARTEFACT_URL + reportHTML)

// need to process video and screenshot links and add into message
// trimmed_video_filename=$(echo $v | sed 's#.*/##' )       


// console.log(video_attachments_slack)
function getVideoLinks() {
    const videosDir = path.join(__dirname, '../..', 'cypress', 'videos');
    const videos = combine.getFiles(videosDir, '.mp4', []);
    console.log(videos)
    videos.forEach((videoObject) => {
    console.log(videoObject)
    video_attachments_slack = `<${REPORT_ARTEFACT_URL}${videoObject}|Video:- $trimmed_video_filename>\n${video_attachments_slack}`
    });
}

// need to provide the PR details, if PR


messageSelector();

function messageSelector() {
    getVideoLinks();
    if (TOTAL_TESTS === undefined || TOTAL_TESTS === 0) {
        status = 'error'
        post = postDataBuildError()
    } else if (TOTAL_FAILURES > 0 || TOTAL_PASSES === 0) {
        status = 'failed'
        post = postDataTestsFailure()
    } else if (TOTAL_FAILURES === 0) {
        status = 'passed'
        post = postDataTestsPassed()
    }
    sendMessage(post)
}

function postDataTestsPassed() {
    const slackMessage = {
        text: `${CIRCLE_PROJECT_REPONAME} test run passed.\nThis run was triggered by <${GIT_COMMIT_URL}|${CIRCLE_USERNAME}>`,
        channel: `${SLACK_API_CHANNEL}`,
        attachments: [{
                color: '#36a64f',
                fallback: `Report available at ${reportHTMLUrl}`,
                text: `Environment: ${CIRCLE_BRANCH}\nTotal Passed:  ${reportStats.totalPasses} `,
                actions: [{
                        type: 'button',
                        text: 'Test Report',
                        url: `${reportHTMLUrl}`,
                        style: 'primary'
                    },
                    {
                        type: 'button',
                        text: 'CircleCI Logs',
                        url: `${CIRCLE_BUILD_URL}`,
                        style: 'primary'
                    }
                ]
            },
            {
                text: `${video_attachments_slack}${screenshot_attachments_slack}`,
                color: '#36a64f'
            }
        ]
    };
    return slackMessage;
};

function postDataTestsFailure() {
    const slackMessage = {
        text: `${CIRCLE_PROJECT_REPONAME} test run failed.\nThis run was triggered by <${GIT_COMMIT_URL}|${CIRCLE_USERNAME}>`,
        channel: `${SLACK_API_CHANNEL}`,
        attachments: [{
                color: '#ff0000',
                fallback: `Report available at ${reportHTMLUrl}`,
                title: `Total Failed: ${reportStats.totalFailures}`,
                text: `Environment: ${CIRCLE_BRANCH}\nTotal Tests: ${reportStats.totalTests}\nTotal Passed:  ${reportStats.totalPasses} `,
                actions: [{
                        type: 'button',
                        text: 'Test Report',
                        url: `${reportHTMLUrl}`,
                        style: 'primary'
                    },
                    {
                        type: 'button',
                        text: 'CircleCI Logs',
                        url: `${CIRCLE_BUILD_URL}`,
                        style: 'primary'
                    }
                ]
            },
            {
                text: `${video_attachments_slack}${screenshot_attachments_slack}`,
                color: '#ff0000'
            }
        ]
    };
    return slackMessage;
};

function postDataBuildError() {
    const slackMessage = {
        text: `${CIRCLE_PROJECT_REPONAME} test build failed.\nThis run was triggered by <${GIT_COMMIT_URL}|${CIRCLE_USERNAME}>`,
        channel: `${SLACK_API_CHANNEL}`,
        attachments: [{
            color: '#ff0000',
            fallback: `Build Log available at ${CIRCLE_BUILD_URL}`,
            text: `Environment: ${CIRCLE_BRANCH}\nTotal Passed:  ${reportStats.totalPasses} `,
            actions: [{
                type: 'button',
                text: 'CircleCI Logs',
                url: `${CIRCLE_BUILD_URL}`,
                style: 'danger'
            }]
        }]
    };
    return slackMessage;
};

function getTestReportStatus() {
    const reportDir = path.join(__dirname, '..', '..', 'mochareports');
    const reportFile = combine.getFiles(reportDir, '.json', []);
    reportHTML = combine.getFiles(reportDir, '.html', []);
    const rawdata = fs.readFileSync(reportFile[0]);
    const parsedData = JSON.parse(rawdata);
    const reportStats = parsedData.stats
    totalSuites = reportStats.suites
    totalTests = reportStats.tests
    totalPasses = reportStats.passes
    totalFailures = reportStats.failures
    totalDuration = reportStats.duration
    return {
        totalSuites,
        totalTests,
        totalPasses,
        totalFailures,
        totalDuration,
        reportFile,
        reportHTML
    };
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