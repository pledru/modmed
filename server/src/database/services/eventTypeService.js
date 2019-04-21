const AWS = require('aws-sdk')
const db = require('./db')
const BaseService = require('./baseService')

db.init

const docClient = new AWS.DynamoDB.DocumentClient()

class EventTypeService extends BaseService {

  getName() {
    return 'EventTypes'
  }

  getKey() {
    return 'id'
  }

  getKeyType() {
    return 'N'
  }

  add(eventType) {
    return new Promise((resolve, reject) => {
      if (!eventType.id || !eventType.description || !eventType.score) {
        reject()
      }
      let eventTypeData = {
        TableName: this.tableName,
        Item: {},
        ConditionExpression: 'attribute_not_exists(id)'
      }
      let k
      for (k in eventType) {
        eventTypeData.Item[k] = eventType[k]
      }
      docClient.put(eventTypeData, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

}

module.exports = EventTypeService
