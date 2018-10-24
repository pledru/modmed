const express = require('express')
let cookieParser = require('cookie-parser')
const http = require('http')
const app = express()
const port = 8082

app.use(cookieParser())
app.use(express.json())
app.use(express.static('public'))

//// NOT SURE THIS IS NEEDED???
//app.use((req, res, next) => {
  //res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  //next()
//})

app.get('/', (req, res) => {
  let cookie = req.cookies.token
  if (cookie == undefined) {
    res.sendfile('public/login.html')
  } else {
    // validate this cookie
    const options = {
      hostname: 'localhost',
      port: 8081,
      path: '/validate',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'x-access-token': cookie
      }
    }
    console.log(options.headers)
    let serverReq = http.get(options, serverRes => {
      let data = ''
      serverRes.on('data', chunk => data += chunk );
      serverRes.on('end', () => {
        console.log(serverRes.statusCode)
        if (serverRes.statusCode == 200) {  // XXXX - TODO 
          res.sendfile('public/main.html')
        } else {
          res.sendfile('public/login.html')
        }
      });
    }).on('error', err => {
      console.log('Error: ' + err.message)
      res.send('error')
    })
  }
})

// TEST - REMOVE
app.get('/init', (req, res) => {
  console.log(req.headers.tz)
  let data = {
    time: new Date().getTime()
  }
  res.send(data)
})

function forwardRequest(req, res, path, method) {
  const body = req.body
  const options = {
    hostname: 'localhost',
    port: 8081,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }
  if (req.cookies != undefined && req.cookies.token != undefined) {
    options.headers['x-access-token'] = req.cookies.token
  }
  let postData = {}
  for (k in body) {
    postData[k] = body[k]
  }
  let serverReq = http.request(options, serverRes => {
    let data = ''
    serverRes.on('data', chunk => {
      data += chunk
    })
    serverRes.on('end', () => {
      token = serverRes.headers['x-access-token']
      if (token == undefined || serverRes.statusCode != 200) {
        res.status(serverRes.statusCode).send(data)
      } else {
        res.cookie('token', token)
        res.send(data)
      }
    })
  }).on('error', err => {
    console.log('Error: ' + err.message)
    res.send('error')
  })
  if (method != 'GET') {
    serverReq.write(JSON.stringify(postData))
  }
  serverReq.end()
}

app.get('/validate', (req, res) => forwardRequest(req, res, '/validate', 'GET'))
app.post('/login', (req, res) => forwardRequest(req, res, '/login', 'POST'))
app.get('/logout', (req, res) => {
  res.clearCookie('token')
  forwardRequest(req, res, '/logout', 'GET')
})
app.post('/signup', (req, res) => forwardRequest(req, res, '/signup', 'POST'))
app.post('/events', (req, res) => forwardRequest(req, res, '/events', 'POST'))
app.get('/events/last', (req, res) => forwardRequest(req, res, '/events/last', 'GET'))
app.get('/eventtypes', (req, res) => forwardRequest(req, res, '/eventtypes', 'GET'))

app.use((req, res) => res.sendStatus(404))

app.listen(port, () => console.log(`app listening on port ${port}`)) 
