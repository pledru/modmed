let timezone = new Date().getTimezoneOffset()
let url = '/init'
fetch(url, {
    headers: {
      tz: timezone
    }
  }).
  then(res => res.json()).
  then(response => {
    let header = document.getElementById('header')
    let n = document.createTextNode(new Date(response.time))
    header.appendChild(n)
    let choices = document.getElementById('choices')
    for (let i = 0; i < choices.childNodes.length; i++) {
      choices.childNodes[i].checked = true
    }
  }).
  catch(error => alert(error)) 

function logout() {
  let url = '/logout'
  fetch(url, {
    credentials: 'same-origin'
  }).
  then(res => { 
    alert(res)
    return res.json()
  }).
  then(response => {
    if (response.status == 'ok') {
      //window.location.href = '/'  TODO
      window.location.href = 'login.html'
    } else {
      // TODO
      alert(response.status)
    }
  }).
  catch(error => alert(error)) 
}

function loadUser() {
  let url = '/validate'
  fetch(url, {
    credentials: 'same-origin'
  }).
  then(res => res.json()).
  then(response => {
    let userInfo = document.getElementById('userInfo')
    let userText = document.createTextNode('Welcome: ' + response.firstName)
    userInfo.appendChild(userText)
  }).
  catch(error => alert(error)) 
}

function loadEventType() {
  let url = '/eventtypes'
  fetch(url, {
    credentials: 'same-origin'
  }).
  then(res => res.json()).
  then(response => {
    //alert(response)
    let eventTypes = document.getElementById('choices')
    for (let i = 0; i < response.Items.length; i++) {
      let event = response.Items[i]
      let input = document.createElement("input")
      input.setAttribute('type', 'checkbox')
      input.id = event.id
      input.name = event.id
      let text = document.createTextNode(event.description)
      eventTypes.appendChild(input)
      eventTypes.appendChild(text)
      eventTypes.appendChild(document.createElement('br'))
    }
    // TODO
  }).
  catch(error => alert(error)) 
}

function loadLatest() {       // TODO
  let url = '/events/latest'
  fetch(url, {
    credentials: 'same-origin'
  }).
  then(res => res.json()).
  then(response => {
  }).
  catch(error => alert(error)) 
}

function submitEvents() {
  let choices = document.getElementById('choices')
  let children = choices.childNodes
  let values = []
  for (let i = 0; i <children.length; i++) {
    let el = children[i]
    if (el.type == 'checkbox' && el.checked) {
      values.push(el.id)
    }
  }
  let url = '/events'
  fetch(url, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({events: values})
  }).
  then(res => {
    if (res.status != 200) {
      // TODO
    }
    res.json().then(data => {
      if (data.status == 'ok') {
        // the selection has been saved for today. Disable it.
        let choices = document.getElementById('choices')
        let children = choices.childNodes
        for (let i = 0; i <children.length; i++) {
          let el = children[i]
          el.disabled = true
        }
        let button = document.getElementById('submit')
        submit.disabled = true
      }
    })
  }).
  catch(error => alert(error))
}

loadUser()
loadEventType()

