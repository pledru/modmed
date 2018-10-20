const AWS = require('aws-sdk')

let init_db = false
let mode_db = 'test'

function init() {
  if (init_db) return;
  AWS.config.update({
    region: 'us-west-2',
    endpoint: 'http://localhost:8000'
  })
  init_db = true;
}

const db = {
  init: init(),
  name: 'modmed',
  mode: 'test'
}

module.exports = db
