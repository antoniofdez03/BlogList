const logger = require('./logger')

const requestLogger = (request, response, next) => {
    logger.info('Method: ', request.method)
    logger.info('Path: ', request.path)
    logger.info('Body: ', request.body)
    logger.info('---')
    next()
}

const ERROR_HANDLERS = {
  CastError: res => 
    res.status(400).send({error: 'id used is malformed'}),

  ValidationError: (res, error) => 
    res.status(409).send({ error: error.message}),

  JsonWebTokenError: res => 
    res.status(401).json({error: 'token missing or invalid'}),

  TokenExpiredError: res => 
    res.status(401).json({error: 'Token expired'}),

  defaultError: res => 
    res.status(500).end()
}

const errorHandler = (error, request, response, next) => {
  console.log(error.name)
  const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError
  handler(response, error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).end()
}

module.exports = {
    requestLogger,
    errorHandler,
    unknownEndpoint

}