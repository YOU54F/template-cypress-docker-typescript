export REPORT_LOCATION=~/app/e2e/cypress/reports/mocha/mochawesome    
export REPORT_LOCATION_JUNIT=~/app/e2e/cypress/reports/junit    
export VIDEO_LOCATION=~/app/e2e/cypress/videos/ 
export SCREENSHOT_LOCATION=~/app/e2e/cypress/screenshots/ 
export REPORT_ARTEFACT_URL=https://circleci.com/api/v1.1/project/github/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/${CIRCLE_BUILD_NUM}/artifacts/0
export REPORT_ARTEFACT_LOCATION=${REPORT_ARTEFACT_URL}${REPORT_LOCATION}.html
export VIDEO_ARTEFACT_LOCATION=${REPORT_ARTEFACT_URL}${VIDEO_LOCATION}


export GIT_COMMIT_URL=https://github.com/${CIRCLE_PROJECT_USERNAME}/${CIRCLE_PROJECT_REPONAME}/commit/${CIRCLE_SHA1}


      for report in $REPORT_LOCATION_JUNIT/*.xml; do
            totalSuiteTestsFailing=$(cat $report | egrep -o 'failures="[^.]' -m1 | cut -d \" -f2)
            totalSuiteTests=$(cat $report | egrep -o 'tests="[^.]' -m1 | cut -d \" -f2)
            totalTestCount=$((totalSuiteTests+totalTestCount))
            failingTestCount=$((totalSuiteTestsFailing+failingTestCount))
            durationTestCount=$durationTestCount+$testSuiteDuration
       done

      export TOTAL_TESTS_PASSING=$((totalTestCount-failingTestCount))
      export TOTAL_TESTS_FAILING=$failingTestCount 
      export TOTAL_TESTS=$totalTestCount
      export TEST_DURATION=$durationTestCount 

      # Travese the artefact folders and pull out all artefacts,
      # format the files so they can be injected into a slack message
      # as a link.
      for v in $VIDEO_LOCATION{,**/,**/**/,**/**/**/}*.mp4; do

      # ignore empty dirs that we globbed that have * in the path
      regex='\*'
        if [[ ! $v =~ $regex ]]
          then
            trimmed_video_filename=$(echo $v | sed 's#.*/##' )       
            video_attachments_slack="<$REPORT_ARTEFACT_URL$v|Video:- $trimmed_video_filename>\n$video_attachments_slack"
        fi
       done
      for s in $SCREENSHOT_LOCATION{,**/,**/**/,**/**/**/}*.png; do

      # ignore empty dirs that we globbed that have * in the path
      regex='\*'
        if [[ ! $s =~ $regex ]]
          then
            trimmed_screenshot_filename=$(echo $s | sed 's#.*/##' )       
            screenshot_attachments_slack="<$REPORT_ARTEFACT_URL$s|Screenshot:- $trimmed_screenshot_filename>\n$screenshot_attachments_slack"
        fi
        done
      # If its a PR add it to the slack request    
      if [[ ((`echo $CIRCLE_PULL_REQUEST | grep -c "pull"` > 0))]]; then 
            pr_link="<${CIRCLE_PULL_REQUEST}| - Pull Request>"
      fi     

# if no tests, we error and we must send this back to slack instead of a false positive
      if [ -z "$TOTAL_TESTS" -o "$TOTAL_TESTS" -eq 0 ]; then
            curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"'${CIRCLE_PROJECT_REPONAME}' test build failed.\nThis run was triggered by <'$GIT_COMMIT_URL'|'${CIRCLE_USERNAME}'>'"$pr_link"'","channel":"'$SLACK_API_CHANNEL'",
            "attachments":[{"color":"#ff0000",
            "title":"There was a build error, see logs for details",
            "text":"Environment: '${CIRCLE_BRANCH}'",
            "actions":[{"type":"button","text":"CircleCI Logs","url":"'${CIRCLE_BUILD_URL}'","style":"danger"}]}]}' \
            $SLACK_WEBHOOK_URL 
# if total tests failing is >= 0 publish failure to slack
      elif [ $TOTAL_TESTS_FAILING -gt 0 -o $TOTAL_TESTS_PASSING -eq 0 ]; then
            curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"'${CIRCLE_PROJECT_REPONAME}' test run failed.\nThis run was triggered by <'$GIT_COMMIT_URL'|'${CIRCLE_USERNAME}'>'"$pr_link"'","channel":"'$SLACK_API_CHANNEL'",
            "attachments":[{"color":"#ff0000","fallback":"Report available at '$REPORT_ARTEFACT_LOCATION'",
            "title":"Total Failed: '$TOTAL_TESTS_FAILING'",
            "text":"Environment: '${CIRCLE_BRANCH}'\nTotal Tests: '$TOTAL_TESTS'\nTotal Passing: '$TOTAL_TESTS_PASSING'",
            "actions":[{"type":"button","text":"Test Report","url":"'$REPORT_ARTEFACT_LOCATION'","style":"primary"},
            {"type":"button","text":"CircleCI Logs","url":"'${CIRCLE_BUILD_URL}'","style":"primary"}]},
            {"text":"'"$video_attachments_slack$screenshot_attachments_slack"'","color":"#ff0000"}]}' \
            $SLACK_WEBHOOK_URL 
# else if total tests failing is equal to 0, publish success to slack
      elif [ $TOTAL_TESTS_FAILING -eq 0 ]; then
            curl -X POST -H 'Content-type: application/json' \
            --data '{"text":"'${CIRCLE_PROJECT_REPONAME}' test run passed.\nThis run was triggered by <'$GIT_COMMIT_URL'|'${CIRCLE_USERNAME}'>'"$pr_link"'","channel":"'$SLACK_API_CHANNEL'",
            "attachments":[{"color":"#36a64f","fallback":"Report available at '$REPORT_ARTEFACT_LOCATION'",
            "text":"Environment: '${CIRCLE_BRANCH}'\nTotal Passed: '$TOTAL_TESTS_PASSING'",
            "actions":[{"type":"button","text":"Test Report","url":"'$REPORT_ARTEFACT_LOCATION'","style":"primary"},
            {"type":"button","text":"CircleCI Logs","url":"'${CIRCLE_BUILD_URL}'","style":"primary"}]},
            {"text":"'"$video_attachments_slack$screenshot_attachments_slack"'","color":"#36a64f"}]}' \
            $SLACK_WEBHOOK_URL     
      # closing if from slack reporting conditions    
      fi 