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

  getEvents(email, from, to) {
console.log(from + ' ' + to);
    return new Promise((resolve, reject) => {
      if (!email) {
        reject()
      }
      if ((from != undefined && isNaN(from)) || (to != undefined && isNaN(to))) {
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
          let events = [];
          if (from != undefined || to != undefined) {
            for (let i = 0; i < data.Items[0].events.length; i++) {
              if (from != undefined && data.Items[0].events[i].timestamp < from) {
                continue
              }
              if (to != undefined && data.Items[0].events[i].timestamp > to) {
                continue
              }
              events.push(data.Items[0].events[i]);
            }
          } else {
            events = data.Items[0].events
          }
          resolve(events)
        }
      })
    })
  }

  addEvent(email, event) {
    return new Promise((resolve, reject) => {
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
