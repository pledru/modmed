const AWS = require('aws-sdk')
const { config } = require('../../config')

let init_db = false

function init() {
  if (init_db) return;
  AWS.config.update({
    region: config.region,
    endpoint: config.endpoint
  })
  init_db = true;
}

const db = {
  init: init(),
  name: 'modmed',
  mode: config.name
}

module.exports = db
