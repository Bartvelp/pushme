const mongoose = require('mongoose')

function connectMongo () {
  mongoose.Promise = global.Promise
  mongoose.connect(process.env.MONGODB_URI, {
    /*
      Buffering allows Mongoose to queue up operations if MongoDB
      gets disconnected, and to send them upon reconnection.
      With serverless, it is better to fail fast when not connected.
    */
    useNewUrlParser: true,
    useFindAndModify: false,
    bufferCommands: false,
    bufferMaxEntries: 0,
    useUnifiedTopology: true
  })
  return new Promise((resolve, reject) => {
    const db = mongoose.connection
    db.on('error', () => {
      console.error('Failed to connect to database')
      reject(Error('Failed to connect to database'))
    })
    db.once('open', () => {
      resolve(mongoose)
    })
  })
}

module.exports = connectMongo
