const express = require('express')
const router = express.Router()
const UserService = require('../database/services/userService')
const { addToken } = require('../utilities/jwtUtil.js')

router.post('/', (req, res) => {
  const body = req.body
  const user = {
    email: body.email,
    password: body.password
  }
  const userService = new UserService()
  const p = userService.get(user)
  p.then(data => {
    addToken(data.email, data.id, res)
    res.status(200).send(data)
  }).catch(error => {
    res.status(401).send({error: error.message})
  })
})

module.exports = router
