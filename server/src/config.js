const environment = process.env.NODE_ENV || 'test'
const allConfig = require('./config.json');
const config = allConfig[environment];

module.exports = {
  config
}
