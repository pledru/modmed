const express = require('express')
const app = express()
const loginRouter = require('./routes/login')
const signupRouter = require('./routes/signup')
const usersRouter = require('./routes/users')
const { verifyToken } = require('./utilities/jwtUtil.js')

const port = 8081

app.use(express.json())

app.use('/test', (req, res) => {
    console.log('TEST')
    res.send('test')
})

app.use('/validate', (req, res) => verifyToken(req, res))
app.use('/login', loginRouter)
app.use('/signup', signupRouter)
app.use('/users', verifyToken, usersRouter)

app.listen(port, () => console.log(`app listening on port ${port}`))
module.exports = app
