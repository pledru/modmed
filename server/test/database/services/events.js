const assert = require('chai').assert;
const EventService = require('../../../src/database/services/eventService')

async function createTable() {
  const eventService = new EventService()

  try {
    let data = await eventService.createTable()
  } catch (error) {
    console.log(error)
  }
}

async function deleteTable() {
  const eventService = new EventService()

  try {
    let data = await eventService.deleteTable()
  } catch (error) {
    console.log(error)
  }
}

async function test() {
  const eventService = new EventService()

  let today = new Date().getTime()
  let yesterday = new Date(today - 1000*3600).getTime()
  let events = [
    { email: 'u4@c1.com', timestamp: 5, score: 4, events: [1, 2, 3, 4] },
    { email: 'u4@c1.com', timestamp: 6, score: 4, events: [1, 2, 3, 5] },
    { email: 'u4@c1.com', timestamp: today, score: 3, events: [2, 3, 4] }
  ]
  let data

  for (let i = 0; i < events.length; i++) {
    try {
      data = await eventService.add(events[i])
    } catch (error) {
      console.log(error)
    }
  }

  try {
    let i = events.length - 1
    data = await eventService.delete(events[i])
  } catch (error) {
    console.log(error)
  }

  try {
    data = await eventService.list()
    //assert.equal(data.Items.length, 3);
    data.Items.forEach(element => console.log(element))
  } catch (error) {
    console.log(error)
  }

  try {
    data = await eventService.getLatest('u4@c1.com')
    assert.equal(data.Items.length, 1);
  } catch (error) {
    console.log(error)
  }

  try {
    data = await eventService.isSet('u4@c1.com')
    console.log(data)
    assert.equal(data, true);
  } catch (error) {
    console.log(error)
  }
}

async function all() {
  let data
  //data = await createTable()
  data = await test()
  //data = await deleteTable()
}

all()
