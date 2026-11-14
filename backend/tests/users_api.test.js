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

    test('an user with invalid username', async () => {
        const newUser = {
            username: "An",
            name: "Antonio",
            password: "12345"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/users')
        expect(response.body).toHaveLength(initialUsers.length)
    })

    test('an user with invalid password', async () => {
        const newUser = {
            username: "Antonio",
            name: "Antonio",
            password: "12"
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/users')
        expect(response.body).toHaveLength(initialUsers.length)
    })
})

afterAll(() => {
    mongoose.connection.close()
    server.close()
})