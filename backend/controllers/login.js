const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const loginRouter = require('express').Router()
const User = require('../models/User')

loginRouter.post('/', async (request, response) => {
    const {username, password} = request.body

    const user = await User.findOne({ username })

    const passwordCorrect = user === null
        ? false
        : await bcrypt.compare(password, user.passwordHash)

    if(!(user && passwordCorrect)) {
        response.status(401).json({
            error: 'invalid user or password'
        })
    }

    const userForToken = {
        id: user._id,
        username: user.username
    }

    const token = jwt.sign(
        userForToken, 
        process.env.SECRET, 
        {
            expiresIn: 60 * 60 * 24 * 7 //7 dias
        }
    )

    response.status(200).send({
        name: user.name,
        username: user.username,
        token
    })
})

module.exports = loginRouter