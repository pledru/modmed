const express = require('express')
const router = express.Router()
const UserService = require('../database/services/userService')

router.get('/', (req, res) => {
  const userService = new UserService()
  userService.list()
    .then((data) => res.json(data))
    .catch((err) => next(err))
})

module.exports = router
