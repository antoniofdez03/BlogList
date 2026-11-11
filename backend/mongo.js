const mongoose = require('mongoose')
const config = require('./utils/config')

const {MONGO_DB_URI, MONGO_DB_URI_TEST, NODE_ENV} = config

const connectionString = NODE_ENV === 'test'
    ? MONGO_DB_URI_TEST
    : MONGO_DB_URI

mongoose.connect(connectionString)