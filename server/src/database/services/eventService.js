const AWS = require('aws-sdk')
const db = require('./db')

db.init

const dynamodb = new AWS.DynamoDB()
const docClient = new AWS.DynamoDB.DocumentClient()

class EventService {

  constructor() {
    this.tableName = db.name + '_' + db.mode + '_' + 'Events'
  }

  createTable() {
    let params = {
      TableName: this.tableName,
      KeySchema: [
        { AttributeName: "email", KeyType: "HASH"},
        { AttributeName: "timestamp", KeyType: "RANGE"}
      ],
      AttributeDefinitions: [
        { AttributeName: "email", AttributeType: "S" },
        { AttributeName: "timestamp", AttributeType: "N" }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      },
      LocalSecondaryIndexes: [
        { IndexName: "timestamp",
          KeySchema: [
            { AttributeName: "email", KeyType: "HASH" },
            { AttributeName: "timestamp", KeyType: "RANGE" }
          ],
          Projection: {
            ProjectionType: "ALL"
          }
        }
      ]
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

  add(event) {
    return new Promise((resolve, reject) => {
      if (!event.email) {
        reject()
      }
      let eventData = {
        TableName: this.tableName,
        Item: {}
      }
      let k
      for (k in event) {
        eventData.Item[k] = event[k]
      }
      docClient.put(eventData, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  getLatest(email) {
    return new Promise((resolve, reject) => {
      if (!email) {
        reject()
      }
      let params = {
        TableName: this.tableName,
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeNames: { '#email': 'email'},
        ExpressionAttributeValues: { ':email': email},
        ScanIndexForward: false,
        Limit: 1
      }
      docClient.query(params, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  /*
   * Check if a value has been entered for the current day.
   * TODO - return either null or the data
   */
  isSet(email) {
    let d = new Date()
    return new Promise((resolve, reject) => {
      let p = this.getLatest(email)
      p.then(data => {
        console.log(data)
        if (data.Items.length == 0) {
          resolve(false)
          return
        }
        console.log(data.Items[0].timestamp)
        let diff = (d.getTime() - data.Items[0].timestamp) / 1000
        if (diff > 3600) { // a day
          resolve(false)
          return
        }
        // if there is less than a day, we check if the two date are on different day
        if (d.getDay() != new Date(data.Items[0].timestamp).getDay()) {
          resolve(false)
          return
        }
        resolve(true)
      }).catch(reason => {
        console.log(data)
        reject(reason)
      })
    })
  }

}

module.exports = EventService
