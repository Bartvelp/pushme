const webpush = require('web-push') // requiring the web-push module
const mongoose = require('mongoose')
const connectMongo = require('./connectMongo')
const fetch = require('node-fetch')

const user = new mongoose.Schema({
  code: String,
  subscription: Object
})

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') { // Discard CORS preflight request
    console.log('Got OPTIONS request')
    res.send('OK')
    return
  }
  if (checkRequest(req)) {
    console.log('Got invalid request', req.body)
    res.status(400).json(checkRequest(req))
    return
  }
  // Request is valid
  configureWebpush()
  // function to send the notification to the subscribed device
  const user = await getUser(req.body.code)
  if (!user) {
    res.status(404).json({
      error: true,
      message: 'Code that is provided not found'
    })
    console.log('Got invalid token', req.body)
    return
  }
  // Send notification
  await webpush.sendNotification(user.subscription, JSON.stringify({ body: req.body.message, title: req.body.title }))
  await fetch(process.env.LOG_SERVER + `?newNotification=${req.body.code}`).catch(e => null)
  console.log('Send notification to:', user.code)
  res.send(JSON.stringify({ success: true }) + '\n')
}

function checkRequest (req) {
  if (!req.body) {
    return {
      error: true,
      message: 'Did not provide a POST body'
    }
  } else if (!req.body.code || typeof req.body.code !== 'string') {
    return {
      error: true,
      message: 'Did not provide a valid code'
    }
  } else if (!req.body.message || typeof req.body.message !== 'string') {
    return {
      error: true,
      message: 'Did not provide a valid message'
    }
  } else if (!req.body.title || typeof req.body.title !== 'string') {
    return {
      error: true,
      message: 'Did not provide a valid title'
    }
  }
  return false
}

function configureWebpush () {
  const vapidKeys = {
    publicKey: 'BIneGPMXfpFUmGRuQ06yVw0Kt5Yh0QWxiMkFnLoo4K0A8MniSFVnDoliE35mQ1zEb6pGTKOWGJSO7YRlfzUmmd8',
    privateKey: process.env.VAPID_PRIV
  }
  // setting our previously generated VAPID keys
  webpush.setVapidDetails(
    'mailto:myuserid@email.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  )
}

async function getUser (code) {
  const mongoose = await connectMongo()
  const PushUser = mongoose.model('user', user)
  return PushUser.findOne({ code }).exec()
}
