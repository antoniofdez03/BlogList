const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/User')

usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', {
    title: 1,
    url: 1,
    likes: 1
  })
  response.json(users)
})

usersRouter.post('/', async (request, response) => {
    try {
        const {body} = request
        const {username, name, password} = body

        if (typeof password !== 'string' || password.length < 3) {
            return response.status(400).json({
                error: 'password must be at least 3 characters long'
            })
        }

        const saltRounds = 10
        const passwordHash = await bcrypt.hash(password, saltRounds)
        const user = new User({
            username,
            name,
            passwordHash
        })

        const savedUser = await user.save()

        response.status(201).json(savedUser)

    } catch(error) {
        console.log(error)
        response.status(400).json({error: error.message})
    }
})

usersRouter.delete('/:id', async (request, response, next) => {
    const { id } = request.params

    try {
        const deletedUser = await User.findByIdAndDelete(id)
        if (!deletedUser) return response.status(404).end()
        response.status(204).end()
    } catch (e) {
        next(e)
    }
})

module.exports = usersRouter