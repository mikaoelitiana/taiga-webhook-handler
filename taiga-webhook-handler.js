const EventEmitter = require('events').EventEmitter
, inherits     = require('util').inherits
, bl           = require('bl')

function create (options) {
  if (typeof options != 'object')
    throw new TypeError('must provide an options object')

  if (typeof options.path != 'string')
    throw new TypeError('must provide a \'path\' option')

  // make it an EventEmitter, sort of
  handler.__proto__ = EventEmitter.prototype
  EventEmitter.call(handler)

  return handler

  function handler (req, res, callback) {
    if (req.url.split('?').shift() !== options.path)
      return callback()

    function hasError (msg) {
      res.writeHead(400, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ error: msg }))

      var err = new Error(msg)

      handler.emit('error', err, req)
      callback(err)
    }

    var signature = req.headers['x-taiga-webhook-signature'];

    if (!signature) {
      return hasError('No X-TAIGA-WEBHOOK-SIGNATURE found on request')
    }

   req.pipe(bl(function (err, data) {
    if (err) {
      return hasError(err.message)
    }

    var obj

    try {
      obj = JSON.parse(data.toString())
    } catch (e) {
      return hasError(e)
    }

      var event = obj.type;

      // Respond to test
      if (event === 'test'){
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end('{"ok":true}')
        handler.emit('test', {})
        return
      }

      // invalid json
      if (!obj || !obj.data || !obj.data.project) {
       return hasError('received invalid data from ' + req.headers['host'] + ', returning 400');
     }

     var project = obj.data.project;

     res.writeHead(200, { 'content-type': 'application/json' })
     res.end('{"ok":true}')

     var emitData = {
      event   : event
      , action  : obj.action
      , payload : obj
      , protocol: req.protocol
      , host    : req.headers['host']
      , url     : req.url
      , signature: signature
    }

    handler.emit(event, emitData)
    handler.emit('*', emitData)
  }))
 }
}


module.exports = create
