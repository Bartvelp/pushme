const mongoose = require('mongoose')
const connectMongo = require('./connectMongo')
const fetch = require('node-fetch')

const user = new mongoose.Schema({
  code: String,
  subscription: Object
})

module.exports = async (req, res) => {
  if (checkRequest(req)) {
    res.status(400).json(checkRequest(req))
    return
  }
  const code = Math.random().toString(36).substring(2)
  const presentCode = await saveSubscription(code, req.body)
  console.log('Saved user:', presentCode)
  await fetch(process.env.LOG_SERVER + `?newSubscription=${presentCode}`).catch(e => null)
  res.json({
    success: true,
    code: presentCode
  })
}

async function saveSubscription (code, subscription) {
  const mongoose = await connectMongo()
  const PushUser = mongoose.model('user', user)
  // First check if user is already present
  const presentUser = await PushUser.findOne({ 'subscription.endpoint': subscription.endpoint }).exec()
  if (presentUser) return presentUser.code
  // Otherwise save it
  console.log('Saving new code:', code)
  const newPushUser = new PushUser({
    code,
    subscription
  })
  await newPushUser.save()
  return code
}

function checkRequest (req) {
  if (!req.body) {
    return {
      error: true,
      message: 'Did not provide a POST body'
    }
  } else if (!req.body.endpoint || typeof req.body.endpoint !== 'string') {
    return {
      error: true,
      message: 'Did not provide a subscription endpoint'
    }
  } else if (!req.body.keys || typeof req.body.keys !== 'object') {
    return {
      error: true,
      message: 'Did not provide a subscription keyset'
    }
  }
}
