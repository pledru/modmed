function load() {
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
load()

let timezone = new Date().getTimezoneOffset()
let url = '/init'
fetch(url, {
    headers: {
      tz: timezone
    }
  }).
  then(res => res.json()).
  then(response => {
    let n = document.createTextNode(new Date(response.time))
    document.body.appendChild(n)
    let choices = document.getElementById('choices')
    for (let i = 0; i < choices.childNodes.length; i++) {
      choices.childNodes[i].checked = true
    }
  }).
  catch(error => alert(error)) 
