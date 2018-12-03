const assert = require('chai').assert;
const EventTypeService = require('../../../src/database/services/eventTypeService')

async function createTable() {
  const eventTypeService = new EventTypeService()

  try {
    let data = await eventTypeService.createTable()
  } catch (error) {
    console.log(error)
  }
}

async function deleteTable() {
  const eventTypeService = new EventTypeService()

  try {
    let data = await eventTypeService.deleteTable()
  } catch (error) {
    console.log(error)
  }
}

async function all() {
  let data
  data = await createTable()
}

all()
