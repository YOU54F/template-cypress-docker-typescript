const https = require('https');
const fs = require('fs');
const AWS = require('aws-sdk');

exports.handler = (event, context, callback) => {
  console.log('in the LAMBDA');
  const testData = new AWS.S3().getObject({
    Bucket: 'cypress.bot.v1',
    Key: 'results.json',
  }, (err, data) => {
    if (!err) {
      const resultsObj = JSON.parse(data.Body.toString());
      return postHandler(resultsObj);
    }
  });

  const postData = (passes, failures) => {
    const slackMessage = {
      mrkdwn: true,
      text: 'Important Request from Scyt Integration Bot',
      attachments: [
        {
          pretext: ' ==================================\n:rocket: *Action Required* - *New Pull Request* :rocket:\n=================================',
          author_name: 'Test Results are ready.',
          title: 'Review test results here',
          title_link: 'http://cypress.bot.v1.s3-website-us-east-1.amazonaws.com/',
          text: `:ok_hand:Passes:  ${passes} \n :boom: Failures:  ${failures}`,
          actions: [
            {
              name: 'Accept Button',
              text: 'Accept',
              type: 'button',
              style: 'primary',
              value: 'maze',
            },
            {
              name: 'Reject Button',
              text: 'Reject',
              style: 'danger',
              type: 'button',
              value: 'war',
              confirm: {
                title: 'Are you sure?',
                text: "Wouldn't you prefer a good game of chess?",
                ok_text: 'Yes',
                dismiss_text: 'No',
              },
            },
          ],
          color: '#36a64f',
          mrkdwn_in: [
            'text',
            'pretext',
          ],
        },
        {
          fallback: 'Required plain-text summary of the attachment.',
          image_url: 'fileURL',
          thumb_url: 'http://example.com/path/to/thumb.png',
          footer: 'Cypress Bots',
          footer_icon: 'https://platform.slack-edge.com/img/default_application_icon.png',
          ts: Date.now(),
        },
      ],
    };
    return JSON.stringify(slackMessage);
  };

  var postHandler = (resultsObj) => {
    const testStats = resultsObj.stats;
    const slackMessage = postData(testStats.passes, testStats.failures);
    const postOptions = {
      host: 'hooks.slack.com',
      path: 'YOUR_WEBHOOK_HERE', // <-- as a string
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const postReq = https.request(postOptions, (res) => {
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        console.log(`Response: ${chunk}`);
      });
    });

    // post the data
    postReq.write(slackMessage);
    postReq.end();
  };
  callback(null, postData);
};

//     ///////////////////////////////////////
//     //////////////////////////////////////
//     // S3 response: event.Records[0].s3
//     // S3 bucket object: event.Records[0].s3.bucket
//     // S3 bucket name: event.Records[0].s3.bucket.name
//     // S3 file object: event.Records[0].s3.object.name
//     // S3 file name: event.Records[0].s3.object.key
//     // SlackWebhookUrl = `https://hooks.slack.com/services/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`
//     /////////////////////////////
//     ////////////////////////////
