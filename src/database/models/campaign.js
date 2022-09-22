const mongoose = require('mongoose')

const definition = {
  campaignName: {
    type: String,
    required: false,
  },
  campaignID: {
    type: String,
    required: false,
  },
  publicKey: {
    type: String,
    required: false,
  },
  privateKey: {
    type: String,
    required: false,
  },
  tokenAddress: {
    type: String,
    required: false,
  },
  dropAddress: {
    type: String,
    required: false,
  },
  contractType: {
    type: String,
    required: false,
  },
  amount: {
    type: String,
    required: false,
  },
  numLink: {
    type: Number,
    required: false,
  },
  client: {
    type: String,
    required: false,
  },
  duration: {
    type: Number,
    required: false,
  },
  gas: {
    type: Number,
    required: false,
  },
  gasTaken: {
    type: Number,
    required: false,
  },
  network: {
    type: String,
    required: false,
  },
  costPerNum: {
    type: String,
    required: false,
  },
}

const options = {
  timestamps: true,
}

const campaignSchema = new mongoose.Schema(definition, options)

module.exports = mongoose.model('campaign', campaignSchema)
