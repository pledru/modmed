const express = require('express')
const router = express.Router()
const UserService = require('../database/services/userService')
const { addToken } = require('../utilities/jwtUtil.js')

router.post('/', (req, res) => {
console.log('SIGNUP')
    const body = req.body
    const user = {
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName
    }
    const userService = new UserService()
    const p = userService.create(user)
    p.then(data => {
      console.log(data)
      const respData = { code: 'ok' }
      addToken(data.email, data.id, res)
      res.status(200).send(respData)
    }).catch(error => {
      const respData = { code: error.code }
      if (error.code == 'ConditionalCheckFailedException') {
        respData.code = 'UserExists'
      }
      res.status(403).send(respData)
    })
})

module.exports = router
