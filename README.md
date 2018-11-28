# Cypress IO Typescript Example 

<!-- [![CircleCI](https://circleci.com/gh/YOU54F/cypressio-docker.svg?style=svg)](https://circleci.com/gh/YOU54F/cypressio-docker)
[![Sonarcloud Status](https://sonarcloud.io/api/project_badges/measure?project=YOU54F_cypressio-docker&metric=alert_status)](https://sonarcloud.io/dashboard?id=YOU54F_cypressio-docker) -->

This is an example project testing the https://the-internet.herokuapp.com/

It showcases the use of 
- Typescript
- The Cypress GUI tool
- The Cypress command line tool
- CircleCI integration & slack reporting
- Mochawesome for fancy reporting
- Integration with Cypress' Dashboard Service for project recording
<!-- - Docker to self contain the application and require no pre-requisites on the host machine, bar Docker. -->

## Installation

- Clone the project

### Local Installation

- Run `cd e2e && npm install` to install cypress in the e2e folder
- We can slot this into any project easily and isolate its dependencies from your project

## Running tests locally

- `npm run cypress:open` - runs test via gui
- `npm run cypress:run`  - run tests via command line