const express = require('express')
const router = express.Router()
const EventTypeService = require('../database/services/eventTypeService')

router.get('/', (req, res) => {
  const eventTypeService = new EventTypeService()
  eventTypeService.list()
    .then((data) => res.send(data))
    .catch((err) => next(err))
})

module.exports = router
