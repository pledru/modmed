// https://stackoverflow.com/questions/16209145/how-to-set-cookie-in-node-js-using-express-framework

// https://medium.freecodecamp.org/securing-node-js-restful-apis-with-json-web-tokens-9f811a92bb52

https://thecodebarbarian.com/common-async-await-design-patterns-in-node.js.html

const jwt = require('jsonwebtoken')


// see login.js



// https://jwt.io/introduction

const payload = { email, userId: result.id }
const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '1d'})

---------------------------------------

  verifyUserInDatabase(userService, email).then(() => {
    const tokenEntry = {
      email: email,
      token: crypto.randomBytes(3).toString('hex') //we will need at least 6 in migrations
    }
    console.log(tokenEntry);
    // TODO: check if token exists and return error.
    return tokenService.insert(tokenEntry).catch(err => {
      throw err
    }).then(result => {

---------

const token = jwt.sign({email: email}, process.env.JWT_SECRET, {expiresIn: 86400})
res.status(200).send({auth: true, token: token});

const token = req.headers['x-access-token']
if (!token) {
  return res.status(401).send({auth: false, message: 'No token provided.'})
}
jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
  if (err) {
    res.status(500).send({auth: false, message: 'Failed to authenticate token.')
  }
  res.status(200).send(decoded)
})

