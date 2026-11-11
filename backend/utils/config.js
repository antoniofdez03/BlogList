require('dotenv').config()

const PORT = process.env.PORT
const MONGO_DB_URI = process.env.MONGO_DB_URI
const MONGO_DB_URI_TEST = process.env.MONGO_DB_URI_TEST

module.exports = {
    PORT,
    MONGO_DB_URI,
    MONGO_DB_URI_TEST
}