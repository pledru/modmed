const AWS = require('aws-sdk')
const db = require('./db')

db.init

const dynamodb = new AWS.DynamoDB()
const docClient = new AWS.DynamoDB.DocumentClient()

class BaseService {

  constructor() {
    this.tableName = db.name + '_' + db.mode + '_' + this.getName()
  }

  getName() {
    // implemented by sub classes, return the name of the table
    throw new Error('Name required by subclass');
  }

  getKey() {
    // implemented by sub classes, return the name of the table
    throw new Error('Key required by subclass');
  }

  getKeyType() {
    // implemented by sub classes, return the name of the table
    throw new Error('KeyType required by subclass');
  }

  createTable() {
    let params = {
      TableName: this.tableName,
      KeySchema: [
        { AttributeName: this.getKey(), KeyType: 'HASH'}
      ],
      AttributeDefinitions: [
        { AttributeName: this.getKey(), AttributeType: this.getKeyType() }
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

  filter(d) {
    return d
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
          data.Items.forEach(d => this.filter(d))
          resolve(data.Items)
        }
      })
    })
  }

  delete(key) {
    return new Promise((resolve, reject) => {
      if (!key) {
        reject()
      }
      let params = {
        TableName: this.tableName,
      }
      let k = {}
      k[this.getKey()] = key
      params.Key = k
      docClient.delete(params, (err, data) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

}

module.exports = BaseService
