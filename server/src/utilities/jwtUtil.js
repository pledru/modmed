const jwt = require('jsonwebtoken')
const UserService = require('../database/services/userService')

function addToken(email, id, res) {
  const token = jwt.sign({email: email, id: id}, process.env.JWT_SECRET, {expiresIn: 86400})
  res.setHeader('x-access-token', token)
}

async function verifyToken(req, res, next) {
  const token = req.headers['x-access-token']
  if (!token) {
    return res.status(401).send({auth: false, message: 'No token provided.'})
  }
  try {
    let decoded = jwt.verify(token, process.env.JWT_SECRET)
    // verify the id has not changed (if the user updated the password)
    const userService = new UserService()
    const data = await userService.get({email: decoded.email})
    if (data.id != decoded.id) {
      return res.status(401).send({auth: false, message: 'Invalid token.'})
    } else {
      req.body.email = decoded.email
      if (next == undefined) {
        return res.status(200).send(data)
      } else {
        next()
      }
    }
  } catch (error) {
    return res.status(500).send({auth: false, message: 'Unable to verify token.'})
  }
}

module.exports = {
  addToken,
  verifyToken
}
