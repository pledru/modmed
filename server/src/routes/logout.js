const express = require('express')
const router = express.Router()
const UserService = require('../database/services/userService')
const { removeToken } = require('../utilities/jwtUtil.js')

router.get('/', (req, res) => {
  removeToken(res)
  res.status(200).send({status: 'ok'})
})

module.exports = router
