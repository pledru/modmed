const assert = require('chai').assert;
const UserService = require('../../../src/database/services/userService')

async function createTable() {
  const userService = new UserService()

  try {
    let data = await userService.createTable()
  } catch (error) {
    console.log(error)
  }
}

async function deleteTable() {
  const userService = new UserService()

  try {
    let data = await userService.deleteTable()
  } catch (error) {
    console.log(error)
  }
}

async function test() {
  const userService = new UserService()
  let user = {
    email: 'u4@c1.com',
    password: '123',
    lastName: 'smith',
    firstName: 'john'
  }
  let data

  //try {
    //data = await userService.create(user)
  //} catch (error) {
    //console.log(error)
  //}

  try {
    data = await userService.list()
    //assert.equal(data.length, 1);
    data.forEach(element => console.log(element))
  } catch (error) {
    console.log(error)
  }

  try {
    data = await userService.get({email: 'u4@c1.com', password: '123'})
    assert.equal('u4@c1.com', data.email)
  } catch (error) {
    console.log(error.message)
  }

  //try {
    //data = await userService.get({email: 'u4@c1.com', password: '124'})
  //} catch (error) {
    //assert.equal(error.message, 'invalidPassword')
    //console.log(error.message)
  //}

  //try {
    //data = await userService.get({email: 'u4@c2.com', password: '123'})
  //} catch (error) {
    //assert.equal(error.message, 'unknownUser')
    //console.log(error.message)
  //}

  try {
    data = await userService.updatePassword({email: 'u4@c1.com', password: '124'})
    console.log(data)
  } catch (error) {
    console.log(error.message)
  }

  try {
    //data = await userService.get({email: 'u4@c1.com', password: '123'})
    data = await userService.get({email: 'u4@c1.com', password: '124'})
    console.log(data)
    assert.equal('u4@c1.com', data.email)
  } catch (error) {
    console.log(error.message)
  }

  try {
    data = await userService.delete({email: 'u4@c1.com'})
  } catch (error) {
    console.log(error.message)
  }

}

async function all() {
  let data
  //data = await createTable()
  data = await test()
  //data = await deleteTable()
}

all()
