const assert = require('chai').assert;
const EventService = require('../../../src/database/services/eventService')

async function test() {
  const eventService = new EventService()

  let today = new Date().getTime()
  let yesterday = new Date(today - 1000*3600).getTime()
  let events = [
    { email: 'u4@c1.com', timestamp: 5, score: 4, events: [1, 2, 3, 4] },
    { email: 'u4@c1.com', timestamp: 6, score: 4, events: [1, 2, 3, 5] },
    { email: 'u4@c1.com', timestamp: today, score: 3, events: [2, 3, 4] }
  ]
  let p

  p = eventService.createTable()
  await p

  for (let i = 0; i < events.length; i++) {
    p = eventService.add(events[i])
    await p
    p.then(data => console.log(data)).catch(error => console.log(error))
  }

  p = eventService.list()
  await p
  p.then(data => {
    assert.equal(data.Items.length, 3);
    data.Items.forEach(element => console.log(element))
  }).catch(error => console.log(error))

  p = eventService.getLatest('u4@c1.com')
  await p
  p.then(data => { 
    assert.equal(data.Items.length, 1);
    console.log(data) 
  }).catch(error => console.log(error))

  p = eventService.isSet('u4@c1.com')
  await p
  p.then(data => {
    assert.equal(data, true);
    console.log(data)
  }).catch(error => console.log(error))
}

async function destroy() {
  const eventService = new EventService()
  p = eventService.deleteTable()
  await p
}

test()
//destroy()
