const logger = require('./logger')

const requestLogger = (request, response, next) => {
    logger.info('Method: ', request.method)
    logger.info('Path: ', request.path)
    logger.info('Body: ', request.body)
    logger.info('---')
    next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error)
  console.log(error.name)
  
  if(error.name === 'CastError'){
    response.status(400).send({
      error: 'id used is malformed'
    })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  else{
    response.status(500).end()
  }
}

const unknownEndpoint = (request, response) => {
  response.status(404).end()
}

module.exports = {
    requestLogger,
    errorHandler,
    unknownEndpoint

}