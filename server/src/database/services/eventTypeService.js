const AWS = require('aws-sdk')
const db = require('./db')

db.init

const dynamodb = new AWS.DynamoDB()
const docClient = new AWS.DynamoDB.DocumentClient()

class EventTypeService {

  constructor() {
    this.tableName = db.name + '_' + db.mode + '_' + 'EventTypes'
  }

  createTable() {
    let params = {
      TableName: this.tableName,
      KeySchema: [
        { AttributeName: "id", KeyType: "HASH"},
        { AttributeName: "description", KeyType: "RANGE"}
      ],
      AttributeDefinitions: [
        { AttributeName: "id", AttributeType: "N" },
        { AttributeName: "description", AttributeType: "S" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    }
    return new Promise((resolve, reject) => {
      dynamodb.createTable(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  deleteTable() {
    let params = {
      TableName: this.tableName
    }
    return new Promise((resolve, reject) => {
      dynamodb.deleteTable(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  list() {
    let params = {
      TableName: this.tableName
    }
    return new Promise((resolve, reject) => {
      docClient.scan(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
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
