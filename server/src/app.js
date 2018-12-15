const { config } = require('./config')
const express = require('express')
const app = express()
const loginRouter = require('./routes/login')
const logoutRouter = require('./routes/logout')
const signupRouter = require('./routes/signup')
const usersRouter = require('./routes/users')
const eventsRouter = require('./routes/events')
const eventTypesRouter = require('./routes/eventTypes')
const { verifyToken } = require('./utilities/jwtUtil.js')

const port = config.port

app.use(express.json())

app.use('/test', (req, res) => {
    console.log('TEST')
    res.send('test')
})

app.use('/validate', (req, res) => verifyToken(req, res))
app.use('/login', loginRouter)
app.use('/logout', logoutRouter)
app.use('/signup', signupRouter)
app.use('/users', verifyToken, usersRouter)
app.use('/events', verifyToken, eventsRouter)
app.use('/events/last', verifyToken, eventsRouter)
app.use('/eventtypes', eventTypesRouter)

app.listen(port, () => console.log(`app listening on port ${port}`))
module.exports = app
