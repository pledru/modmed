const assert = require('chai').assert;
const UserService = require('../../../src/database/services/userService')

async function createTables() {
  const userService = new UserService()
  let data

  try {
    data = await userService.createTable()
  } catch (error) {
    console.log(error)
  }
}

createTables()
