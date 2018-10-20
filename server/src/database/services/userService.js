const AWS = require('aws-sdk')
const bcrypt = require('bcrypt')
const db = require('./db')

db.init

const dynamodb = new AWS.DynamoDB()
const docClient = new AWS.DynamoDB.DocumentClient()

class UserService {

  constructor() {
    this.tableName = db.name + '_' + db.mode + '_' + 'Users'
  }

  createTable() {
    let params = {
      TableName: this.tableName,
      KeySchema: [
        { AttributeName: 'email', KeyType: 'HASH'}
      ],
      AttributeDefinitions: [
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 10,
        WriteCapacityUnits: 10
      }
    }
    return new Promise((resolve, reject) => {
      dynamodb.createTable(params, (err, data) => {
        if (err) {
          console.log(err)
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
          console.log(err)
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
          console.log(err)
          reject(err)
        } else {
          data.Items.forEach(d => delete d.hashedpassword)
          resolve(data.Items)
        }
      })
    })
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

  delete(user) {
  }

}

async function test() {
  user = {
    email: 'u4@c1.com',
    lastName: 'smith',
    firstName: 'john'
  }
  let userService = new UserService();
  let p

  p = userService.createTable()
  await p
  p.then(data => console.log(data)).catch(reason => console.log(reason))

  p = userService.add(user)
  await p
  p.then(data => console.log(data)).catch(reason => console.log(reason))

  p = userService.list()
  await p
  p.then(data => {
    data.Items.forEach(element => console.log(element))
  }).catch(reason => console.log(reason))

  p = userService.deleteTable()
  await p
  p.then(data => console.log(data)).catch(reason => console.log(reason))

}

//test()


module.exports = UserService
