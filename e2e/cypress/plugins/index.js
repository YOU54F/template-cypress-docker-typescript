// cypress/plugins/index.js

const wp = require('@cypress/webpack-preprocessor')
const fs = require('fs-extra')
const path = require('path')

module.exports = (on,config) => {
  
  const options = {
    webpackOptions: require('../../webpack.config'),
  }
  on('file:preprocessor', wp(options))
  return processConfig(on, config)
}

function processConfig(on, config) {
  const file = config.env.configFile || 'no_env_default'
  return getConfigurationByFile(file).then(function(file) {
    if (config.env.configFile === 'development') {
      if (!process.env.URI_ROOT) {
        throw new Error('URI_ROOT not set - export URI_ROOT=http://yourlocalhost.com');
      }
      // append the URI_ROOT to the baseUrl
      file.baseUrl = file.baseUrl + process.env.URI_ROOT
    }
    // always return the file object
    return file
  })
}

function getConfigurationByFile(file) {
  const pathToConfigFile = path.resolve('cypress', 'config', `${file}.json`)
  return fs.readJson(pathToConfigFile)
}

