/// &amp;amp;amp;lt;reference path="node_modules/@slack/dist/types/index.d.ts"&amp;amp;amp;gt;
/// &amp;amp;amp;lt;reference path="node_modules/@slack/webhook/dist/IncomingWebhook.d.ts"&amp;amp;amp;gt;
import * as fs from "fs"
import * as path from "path"
import { MessageAttachment } from "@slack/types";
import {
  IncomingWebhookSendArguments,
  IncomingWebhook,
  IncomingWebhookDefaultArguments
} from "@slack/webhook";

const {
  CIRCLE_SHA1,
  CIRCLE_BRANCH,
  CIRCLE_USERNAME,
  CIRCLE_BUILD_URL,
  CIRCLE_BUILD_NUM,
  CIRCLE_PULL_REQUEST,
  CIRCLE_PROJECT_REPONAME,
  CIRCLE_PROJECT_USERNAME
} = process.env;
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL as string;

const VCS_ROOT = "github"; //change to bitbucket, if circleci project hosted on bitbucket
const VCS_BASEURL_GITHUB = "https://github.com";
const VCS_BASEURL_BITBUCKET = "https://bitbucket.org";
const CIRCLE_URL = "https://circleci.com/api/v1.1/project";
const GIT_COMMIT_URL = `${VCS_BASEURL_GITHUB}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commit/${CIRCLE_SHA1}`;
const BITBUCKET_COMMIT_URL = `${VCS_BASEURL_BITBUCKET}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commits/${CIRCLE_SHA1}`;
const REPORT_ARTEFACT_URL = `${CIRCLE_URL}/${VCS_ROOT}/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/${CIRCLE_BUILD_NUM}/artifacts/0`;
let pr_link: string = "";
let video_attachments_slack: string = "";
let screenshot_attachments_slack: string = "";
let reportHTML;
const reportHTMLUrl = REPORT_ARTEFACT_URL + reportHTML;

let attachments: MessageAttachment;
let sendArgs: IncomingWebhookSendArguments;
let totalSuites: number;
let totalTests: number;
let totalPasses: number;
let totalFailures: number;
let totalDuration: number;

const reportStats = getTestReportStatus(); // process the test report
sendMessage();

function sendMessage() {
  getVideoLinks(); //
  getScreenshotLinks();
  prChecker();
  let status;
  if (reportStats.totalTests === undefined || reportStats.totalTests === 0) {
    status = "error";
    let webhookInitialArguments = webhookInitialArgs({}, status);
    let webhook = new IncomingWebhook(
      SLACK_WEBHOOK_URL,
      webhookInitialArguments
    );
    let reports = attachmentReports(attachments, status);
    let sendArguments = webhookSendArgs(sendArgs, [reports]);
    webhook.send(sendArguments);
  } else if (reportStats.totalFailures > 0 || reportStats.totalPasses === 0) {
    status = "failed";
    let webhookInitialArguments = webhookInitialArgs({}, status);
    let webhook = new IncomingWebhook(
      SLACK_WEBHOOK_URL,
      webhookInitialArguments
    );
    let reports = attachmentReports(attachments, status);
    let artefacts = attachementsVideoAndScreenshots(attachments, status);
    let sendArguments = webhookSendArgs(sendArgs, [reports, artefacts]);
    webhook.send(sendArguments);
  } else if (reportStats.totalFailures === 0) {
    status = "passed";
    let webhookInitialArguments = webhookInitialArgs({}, status);
    let webhook = new IncomingWebhook(
      SLACK_WEBHOOK_URL,
      webhookInitialArguments
    );
    let reports = attachmentReports(attachments, status);
    let artefacts = attachementsVideoAndScreenshots(attachments, status);
    let sendArguments = webhookSendArgs(sendArgs, [reports, artefacts]);
    webhook.send(sendArguments);
  }
}

function webhookInitialArgs(
  initialArgs: IncomingWebhookDefaultArguments,
  status: string
) {
  switch (status) {
    case "passed": {
      initialArgs = {
        text: `${CIRCLE_PROJECT_REPONAME} test run passed.\nThis run was triggered by <${GIT_COMMIT_URL}|${CIRCLE_USERNAME}>${pr_link}`
      };
      break;
    }
    case "failed": {
      initialArgs = {
        text: `${CIRCLE_PROJECT_REPONAME} test run failed.\nThis run was triggered by <${GIT_COMMIT_URL}|${CIRCLE_USERNAME}>${pr_link}`
      };
      break;
    }
    case "error": {
      initialArgs = {
        text: `${CIRCLE_PROJECT_REPONAME} test build failed.\nThis run was triggered by <${GIT_COMMIT_URL}|${CIRCLE_USERNAME}>${pr_link}`
      };
      break;
    }
  }
  return initialArgs;
}

function webhookSendArgs(
  sendArgs: IncomingWebhookSendArguments,
  attachments: MessageAttachment[]
) {
  sendArgs = {
    attachments,
    unfurl_links: true,
    unfurl_media: false
  };
  return sendArgs;
}

function attachmentReports(attachments: MessageAttachment, status: string) {
  switch (status) {
    case "passed": {
      attachments = {
        color: "#36a64f",
        fallback: `Report available at ${reportHTMLUrl}`,
        text: `Branch: ${CIRCLE_BRANCH}\nTotal Passed:  ${totalPasses}`,
        actions: [
          {
            type: "button",
            text: "Test Report",
            url: `${reportHTMLUrl}`,
            style: "primary"
          },
          {
            type: "button",
            text: "CircleCI Logs",
            url: `${CIRCLE_BUILD_URL}`,
            style: "primary"
          }
        ]
      };
      break;
    }
    case "failed": {
      attachments = {
        color: "#ff0000",
        fallback: `Report available at ${reportHTMLUrl}`,
        title: `Total Failed: ${reportStats.totalFailures}`,
        text: `Branch: ${CIRCLE_BRANCH}\nTotal Tests: ${
          reportStats.totalTests
        }\nTotal Passed:  ${reportStats.totalPasses} `,
        actions: [
          {
            type: "button",
            text: "Test Report",
            url: `${reportHTMLUrl}`,
            style: "primary"
          },
          {
            type: "button",
            text: "CircleCI Logs",
            url: `${CIRCLE_BUILD_URL}`,
            style: "primary"
          }
        ]
      };
      break;
    }
    case "error": {
      attachments = {
        color: "#ff0000",
        fallback: `Build Log available at ${CIRCLE_BUILD_URL}`,
        text: `Branch: ${CIRCLE_BRANCH}\nTotal Passed:  ${
          reportStats.totalPasses
        } `,
        actions: [
          {
            type: "button",
            text: "CircleCI Logs",
            url: `${CIRCLE_BUILD_URL}`,
            style: "danger"
          }
        ]
      };
      break;
    }
  }
  return attachments;
}

function attachementsVideoAndScreenshots(
  attachments: MessageAttachment,
  status: string
) {
  switch (status) {
    case "passed": {
      attachments = {
        text: `${video_attachments_slack}${screenshot_attachments_slack}`,
        color: "#36a64f"
      };
      break;
    }
    case "failed": {
      attachments = {
        text: `${video_attachments_slack}${screenshot_attachments_slack}`,
        color: "#ff0000"
      };
      break;
    }
  }
  return attachments;
}

function getFiles(dir: string, ext: string, fileList: Array<string>) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  const files = fs.readdirSync(dir);
  files.forEach((file: string) => {
    const filePath = `${dir}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      getFiles(filePath, ext, fileList);
    } else if (path.extname(file) === ext) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function getTestReportStatus() {
  const reportDir = path.join(__dirname, "..", "..", "mochareports");
  const reportFile = getFiles(reportDir, ".json", []);
  reportHTML = getFiles(reportDir, ".html", []);
  const rawdata = fs.readFileSync(reportFile[0]);
  const parsedData = JSON.parse(rawdata.toString());
  const reportStats = parsedData.stats;
  totalSuites = reportStats.suites;
  totalTests = reportStats.tests;
  totalPasses = reportStats.passes;
  totalFailures = reportStats.failures;
  totalDuration = reportStats.duration;
  return {
    totalSuites,
    totalTests,
    totalPasses,
    totalFailures,
    totalDuration,
    reportFile
  };
}

function prChecker() {
  if (CIRCLE_PULL_REQUEST) {
    if (CIRCLE_PULL_REQUEST.indexOf("pull") > -1) {
      return (pr_link = `<${CIRCLE_PULL_REQUEST}| - PR >`);
    }
  }
}

function getVideoLinks() {
  const videosDir = path.join(__dirname, "../..", "cypress", "videos");
  const videos = getFiles(videosDir, ".mp4", []);
  videos.forEach(videoObject => {
    let trimmed_video_filename = path.basename(videoObject);
    video_attachments_slack = `<${REPORT_ARTEFACT_URL}${videoObject}|Video:- ${trimmed_video_filename}>\n${video_attachments_slack}`;
  });
}

function getScreenshotLinks() {
  const screenshotDir = path.join(__dirname, "../..", "cypress", "screenshots");
  const screenshots = getFiles(screenshotDir, ".png", []);
  screenshots.forEach(screenshotObject => {
    let trimmed_screenshot_filename = path.basename(screenshotObject);
    screenshot_attachments_slack = `<${REPORT_ARTEFACT_URL}${screenshotObject}|Screenshot:- ${trimmed_screenshot_filename}>\n${screenshot_attachments_slack}`;
  });
}
