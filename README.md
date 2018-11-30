# Cypress IO Typescript Example

[![CircleCI](https://circleci.com/gh/YOU54F/cypressio-docker-typescript.svg?style=svg)](https://circleci.com/gh/YOU54F/cypressio-docker-typescript)

This is an example project testing a few different sites

It showcases the use of:-

- Typescript
- The Cypress GUI tool
- The Cypress command line tool
- Cypress custom commands `cy.foo()`
- PageObject Models on a Login Site
- Resuable Web Selectors
- CircleCI integration
- Slack reporting
- Mochawesome for fancy HTML reporting
- DevTools console log output on test fail
- Integration with Cypress' Dashboard Service for project recording
- Docker to self contain the application and require no pre-requisites on the host machine, bar Docker.

## Installation

- Clone the project

### Local Installation

- Run `cd e2e && npm install` to install cypress in the e2e folder
- We can slot this into any project easily and isolate its dependencies from your project
- View the `Makefile` for available commands

### Docker Installation

- Run `make docker-build` in the project 
- View the `Makefile` for available docker commands

## Configuration

The main cypress configuration file, is in the e2e folder

- `cypress.json`

It can contain configuration options applicable to all environments

Environment specific config files are stored in `e2e/config/<environment.json>`

These will override any configurations specific environment vars set in `cypress.json`

these can be set on the command line by

- `--env configFile=<environment.json>`

Currently supported environments are

- development
- production
- staging
- qa

If no option is provided is will default to the baseUrl defined in `e2e/config.json`

In order to setup development, you will need a website locally running and your URI_ROOT should be set.

`export URI_ROOT=<your_root_url>`

If you are using docker then please set your URI_ROOT in your docker-compose file, it is set in this example

```yaml
        environment:
            - URI_ROOT=http://the-internet.herokuapp.com
```

If it's URI_ROOT is not, and you select `--env configFile=development` the application will error, and ask you to set it.

## Running tests in Docker via Make

- `make docker-build` - Build the image
- `make docker-test-local` - Run the tests
- `make docker-bash` - Access the bash shell in the container

For more, see the Makefile

## Running tests locally via Make

- `make test-local` 
- `make test-qa`
- `make test-staging` 
- `make test-production` 

## Direct from the command line

- `npm run cypress:open` - runs test via gui
- `npm run cypress:run`  - run tests via command line
- `--env configFile=<env>` - select an environment specific config
- `-s '<pathToFile>'` path for the spec files you wish to run 
  - `-s 'cypress/integration/commands.spec.js'` example

### GUI - Any changes made to test files are automatically picked up by the GUI and executed, post file save

- `make test-local-gui` Opens the GUI with the development configuration selection
- `make test-qa-gui`    Opens the GUI with the qa configuration selection

The GUI can be opened by `npx cypress open` but requires a `--env configFile=<env>` option in order to set the correct BaseURL

### Reporting

- Videos of each run are stored in `e2e/cypress/videos`
- Screenshots of failing tests are stored in `e2e/cypress/screenshots`
- HTML Reports of test runs are generated with MochaAwesome are stored in `e2e/cypress/reports`
- One report is generated per spec file
- A report bundler is provided which will process each report in `e2e/cypress/reports` and combine them into a single HTML document with a random uuid title in `e2e/mochareports`
- The report bundler can be run with `make combine-reports`
- It can be published to an AWS S3 bucket with `make publish-reports-s3`
- To publish to a bucket, set the following env vars

```sh
 export BUCKET_NAME=<YOUR_BUCKET_NAME>
 export AWS_ACCESS_ID=<YOUR_AWS_ACCESS_ID>
 export AWS_SECRET_KEY=<YOUR_AWS_SECRET_KEY>
```


## Typescript

- Spec (test) files are written as `example.spec.ts` and contained in `e2e/cypress/integration`
- There is a `tsconfig.json` file in the `e2e` folder
  - It includes the paths for the `.ts` files. If you add other paths for yours, include them here.
  - It contains the typescript options and includes the Cypress typings for code completion.
  - use visual studio code (if you aren't already) - it's free and comes feature packed.
- There is a `tslint.json` file in the `e2e` folder
  - Contains some rules for code linting
- Tests are compiled with webpack typescript pre-processor.
  - The config file is in `e2e/webpack.config.js`
  - It is loaded in `e2e/cypress/plugins/index.js`, hooking into cypress's `on` event.

## CircleCI

This project is building in CircleCI and can be viewed at the following link

https://circleci.com/gh/YOU54F/cypressio-docker-typescript

See the `.circleci` folder

- `config.yml` - Contains the CircleCI build configuration

### Slack Reporting

A bash file has been written in order to publish results

- `.circleci/slack-alert.sh`

It provides the following distinct message types

- Build Failure / Cypress error
- Test Failure
- Test Success

It provides the following information

- CircleCI Build Status
- Test Stats (Total Tests / Passes / Failures)
- Author with link to Github commit
- Branch name
- Pull Request number and link to PR (only if PR)

And the following build/test artefacts

- CircleCI Build Log button
- HTML Test report button (only on build success)
- Videos of test runs (one link per test)
- Screenshots of failed tests (one link per failing test)

You will need to set up a couple of things in order to use this.

First build a Slack app & create an incoming webhook

- https://api.slack.com/slack-apps

Set the following environment variable in your localhost or CI configuration

- `$SLACK_WEBHOOK_URL` - The full URL you created in the last step
- `$SLACK_API_CHANNEL` - The channel ref you wish to publish to (right-click on your channel and click copy link, check the link, its the digits after the last / )

### Cypress Dashboard Recording

CircleCI builds pass in a `CYPRESS_RECORD_KEY` in order to publish the results to the Cypress Dashboard.

We run `make test-record` to set the `--record` flag and publish the results to the dashboard.

## TODO

- Applitools Integration
- Convert the slack-alert bash file into to a .ts file (Github thinks this is a shell project - waaaaah) - and add some tests!
- publish to s3 bucket needs error handling, should exit each function gracefully if the directories are empty
