const express = require('express')
const router = express.Router()
const EventTypeService = require('../database/services/eventTypeService')
const UserService = require('../database/services/userService')

let eventTypes;

async function getEventType() {
  if (eventTypes == undefined) {
    const eventTypeService = new EventTypeService()
    try {
      eventTypes = await eventTypeService.list()
    } catch (error) {
      console.log(error)
    }
  }
  return eventTypes
}

async function getEvents(email, from, to) {
  const userService = new UserService()
  let data
  try {
    data = await userService.getEvents(email, from, to)
    return data
  } catch (error) {
    console.log(error)
    throw (error)
  }
}

async function addEvent(email, event, tz) {
  const userService = new UserService()
  let data
  try {
    data = await userService.addEvent(email, event, tz)
  } catch (error) {
    console.log(error)
    throw (error)
  }
  return data
}

router.post('/', async (req, res) => {
  const body = req.body
  const email = body.email
  const types = body.types
  const tz = body.tz
  let score = 0
  let eventTypes = await getEventType()
  for (let i = 0; i < types.length; i++) {
    for (let j = 0; j < eventTypes.length; j++) {
      if (types[i] == eventTypes[j].id) {
        score += eventTypes[j].score
      }
    }
  }
  let event = {
    score: score,
    timestamp: new Date().getTime(),
    types: types
  }
  try {
    let r = await addEvent(email, event, tz)
    res.send({status: 'ok'})
  } catch (error) {
    console.log(error)
    res.send({status: 'error'})
  }
})

router.get('/', async (req, res) => {
  const body = req.body
  const email = body.email
  const from = req.query.from
  const to = req.query.to
  try {
    let events = await getEvents(email, from, to)
    res.send(events)
  } catch (error) {
    console.log(error)
    res.send({status: 'error'})
  }
})

router.get('/last', async (req, res) => {
  /* TODO */
  console.log('LAST EVENT')
  res.send({test: 'test'})
})

module.exports = router
