const AWS = require('aws-sdk')
const bcrypt = require('bcrypt')
const db = require('./db')
const BaseService = require('./baseService')

db.init

const docClient = new AWS.DynamoDB.DocumentClient()

class UserService extends BaseService {

  getName() {
      return 'Users'
  }

  getKey() {
    return 'email'
  }

  filter(d) {
    delete d.hashedpassword
    return d
  }

  create(user) {
    return new Promise((resolve, reject) => {
      if (!user.email || !user.password) {
        reject()
      }
      user.email = user.email.toLowerCase()
      let userData = {
        TableName: this.tableName,
        Item: {},
        ConditionExpression: 'attribute_not_exists(email)'
      }
      let k
      for (k in user) {
        if (k == 'password') continue
        userData.Item[k] = user[k]
      }
      userData.Item.id = 0
      userData.Item.hashedpassword = bcrypt.hashSync(user.password, 8)
      docClient.put(userData, (err, data) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(userData.Item)
        }
      })
    })
  }

  updatePassword(user) {
    return new Promise((resolve, reject) => {
      if (!user.email || !user.password) {
        reject()
      }
      let hashedpassword = bcrypt.hashSync(user.password, 8)
      let params = {
        TableName: this.tableName,
        Key: {'email': user.email},
        UpdateExpression: 'set hashedpassword = :hashedpassword add id :inc',
        ExpressionAttributeValues: {':hashedpassword': hashedpassword, ':inc': 1},
        ReturnValues: 'UPDATED_NEW'
      }
      docClient.update(params, (err, data) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  get(user) {
    return new Promise((resolve, reject) => {
      if (!user.email) {
        reject()
      }
      let params = {
        TableName: this.tableName,
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeNames: {'#email': 'email'},
        ExpressionAttributeValues: {':email': user.email }
      }
      docClient.query(params, (err, data) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          if (data.Items.length != 1) {
            reject(new Error('unknownUser'))
          } else {
            // validate the password if passed in
            if (user.password == undefined) {
              delete data.Items[0].hashedpassword
              resolve(data.Items[0])
            } else if (bcrypt.compareSync(user.password, data.Items[0].hashedpassword)) {
              delete data.Items[0].hashedpassword
              resolve(data.Items[0])
            } else {
              reject(new Error('invalidPassword'))
            }
          }
        }
      })
    })
  }

  getEvents(email) {
    return new Promise((resolve, reject) => {
      if (!email) {
        reject()
      }
      let params = {
        TableName: this.tableName,
        ProjectionExpression: 'events',
        KeyConditionExpression: '#email = :email',
        ExpressionAttributeNames: {'#email': 'email'},
        ExpressionAttributeValues: {':email': email }
      }
      docClient.query(params, (err, data) => {
        if (err) {
          console.log(err)
          reject(err)
        } else {
          resolve(data.Items[0].events)
        }
      })
    })
  }

  addEvent(event) {
    return new Promise((resolve, reject) => {
      let email = event.email
      delete event.email
      let params = {
        TableName: this.tableName,
        Key: {email: email},
        UpdateExpression: 'set #events = list_append(if_not_exists(#events, :empty_list), :event)',
        ExpressionAttributeNames: { '#events': 'events' },
        ExpressionAttributeValues: {
          ':event': [ event ],
          ':empty_list': []
        },
        ReturnValues: 'NONE'
      }
      docClient.update(params, (err, data) => {
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

module.exports = UserService
