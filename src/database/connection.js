const mongoose = require('mongoose')

mongoose.connection.on('connecting', () => {
  console.info(`Connecting to Mongo at ${process.env.MONGO_URI}`)
})

mongoose.connection.on('connected', () => {
  console.info('Mongo connection established')
})

mongoose.connection.on('error', (error) => {
  console.error('Mongo connection error', error)
})

function establishDbConnection() {
  try {
    mongoose.connect(process.env.MONGO_URI)
  } catch (error) {
    console.error('Mongo Connection Error:, {}', error)
  }
}

module.exports = { establishDbConnection }
