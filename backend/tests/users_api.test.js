const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')
const server = require('../index')
const User = require('../models/User')

const api = supertest(app)

const initialUsers = [
    {
        username: "Antoniofdez03",
        name: "Antonio",
        passwordHash: "1234"
    }
]

beforeEach(async () => {
    await User.deleteMany({})

    for( let user of initialUsers) {
        const userObject = new User(user)
        await userObject.save()
    }
})

describe('GET', () => {
    test('all users', async () => {
        const response = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(initialUsers.length)
    })
})

describe('POST', () => {
    test('a valid user', async () => {
        const newUser = {
            username: "Antonio",
            name: "Antonio",
            password: "12345"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/users')
        expect(response.body).toHaveLength(initialUsers.length + 1)
    })

    test('an user with existing username', async () => {
        const newUser = {
            username: "Antoniofdez03",
            name: "Antonio",
            password: "12345"
        }

        const postResponse = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const getResponse = await api.get('/api/users')
        expect(getResponse.body).toHaveLength(initialUsers.length)
        expect(postResponse.body.error).toContain('duplicate key error')
    })

    test('an empty user', async () => {
        const newUser = {}

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/users')
        expect(response.body).toHaveLength(initialUsers.length)
    })

    test('an user with empty username', async () => {
        const newUser = {
            name: "Antonio",
            password: "12345"
        }

        const postResponse = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const getResponse = await api.get('/api/users')
        expect(getResponse.body).toHaveLength(initialUsers.length)
        expect(postResponse.body.error).toContain('`username` is required')
    })

    test('an user with empty password', async () => {
        const newUser = {
            username: "Anto",
            name: "Antonio"
        }

        const postResponse = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const getResponse = await api.get('/api/users')
        expect(getResponse.body).toHaveLength(initialUsers.length)
        expect(postResponse.body.error).toContain('password must be at least 3 characters long')
    })

    test('an user with invalid username', async () => {
        const newUser = {
            username: "An",
            name: "Antonio",
            password: "12345"
        }

        const postResponse = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const getResponse = await api.get('/api/users')
        expect(getResponse.body).toHaveLength(initialUsers.length)
        expect(postResponse.body.error).toContain('Username must be at least 3 characters long')
    })

    test('an user with invalid password', async () => {
        const newUser = {
            username: "Antonio",
            name: "Antonio",
            password: "12"
        }

        const postResponse = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const getResponse = await api.get('/api/users')
        expect(getResponse.body).toHaveLength(initialUsers.length)
        expect(postResponse.body.error).toContain('password must be at least 3 characters long')
    })
})

afterAll( async () => {
    await mongoose.connection.close()
    server.close()
})