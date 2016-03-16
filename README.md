# gitlab-webhook-handler

Modify **[rvagg/github-webhook-handler](https://github.com/rvagg/github-webhook-handler)** to fit Taiga.

Taiga allows you to register **[Webhooks](http://taigaio.github.io/taiga-doc/dist/webhooks.html)** for your projects. Each time an event occurs on your project, whether it be creating user stories, filling issues or updating tasks, the webhook address you register can be configured to be pinged with details.

This library is a small handler (or "middleware" if you must) for Node.js web servers that handles all the logic of receiving and verifying webhook requests from GitHub.


## Example

$ npm install taiga-webhook-handler

```js
var http = require('http')
var createHandler = require('taiga-webhook-handler')
var handler = createHandler({ path: '/webhook' })

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(7777)

console.log("Taiga Hook Server running at http://0.0.0.0:7777/webhook");

handler.on('error', function (err) {
  	console.error('Error:', err.message)
})

handler.on('issues', function (event) {
  	console.log('Received an issue event for %s action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title)
})
```
