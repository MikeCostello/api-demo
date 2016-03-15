
var p = require('../package.json');
var version = p.version.split('.').shift();
var config = {
  restApiRoot: '/api' + (version > 0 ? '/v' + version : ''),
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  protocol: 'https',
  demoCredentials: {
    username : 'demo',
    password : '1234'
  }
};

config.url = config.protocol + '://' + config.host + ':' + config.port + config.restApiRoot;

module.exports = config;