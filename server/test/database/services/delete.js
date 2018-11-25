const assert = require('chai').assert;
const UserService = require('../../../src/database/services/userService')

async function deleteTables() {
  const userService = new UserService()
  let data

  try {
    data = await userService.deleteTable()
  } catch (error) {
    console.log(error)
  }
}

deleteTables()
