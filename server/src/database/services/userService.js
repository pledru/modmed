const AWS = require('aws-sdk')
const bcrypt = require('bcrypt')
const db = require('./db')
const BaseService = require('./baseService')

db.init

const docClient = new AWS.DynamoDB.DocumentClient()

/*
 * Checks that the second date is greater than the first
 * and whether two dates expressed in time
 * are on different days:
 * - more than 24 hours
 * or on different day relative to a timezone
 */
function validateDate(time1, time2, tzOffset) {
  let dayMilliSec = 24 * 60 * 60 * 1000
  if (time2 < time1) {
    return false
  }
  /*
   * if the two times are more than a day apart, this is valid.
   */
  if ((time1 - time2) > dayMilliSec) {
    return true
  }
  /* convert the offset in seconds */
  let offset = tzOffset * 60 * 1000
  /* shift the times */
  let t1 = time1 + offset
  let t2 = time2 + offset
  /*
   * if the two derived dates relative to the timezone are on
   * different days, this is valid
   */
  if (new Date(t1).getDate() != new Date(t2).getDate()) {
    return true
  }
  return false
}

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
        // retrieve all the fields except the events
        ProjectionExpression: 'id, email, firstName, lastName, hashedpassword, lastEvent',
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

  async addEvent(email, event, tz) {
    if (email == undefined || event == undefined || tz == undefined) {
      throw new Error('missing parameter')
    }
    let r
    try {
      r = await this.get({email: email})
    } catch (error) {
      console.log(error);
    }
    if (r != undefined && r.lastEvent != undefined) {
      // ensure that no event already exist for the given day
      let valid = validateDate(r.lastEvent.timestamp, event.timestamp, tz)
      if (!valid) {
        throw new Error('invalid date: ' + event.timestamp + ' previous: ' + r.lastEvent.timestamp)
      }
    }

    return new Promise((resolve, reject) => {
      let expr = 'set #lastEvent = :lastEvent, ' +
                 '#events = list_append(if_not_exists(#events, :empty_list), :event)'
      let params = {
        TableName: this.tableName,
        Key: {email: email},
        UpdateExpression: expr,
        ExpressionAttributeNames: { '#lastEvent' : 'lastEvent', '#events': 'events' },
        ExpressionAttributeValues: {
          ':lastEvent': event,
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
