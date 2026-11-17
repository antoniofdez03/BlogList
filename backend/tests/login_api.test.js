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
        passwordHash: "$2b$10$.tp6EiTjY77/LoN5ud47gOIcrN9rqZLOCsC11MuCYFfxflhqkQxgK"
    }
]

beforeEach(async () => {
    await User.deleteMany({})

    for( let user of initialUsers) {
        const userObject = new User(user)
        await userObject.save()
    }
})

describe('POST', () => {
    test('login a valid user', async () => {
        const user = {
            username: 'Antoniofdez03',
            password: '1234'
        }
        
        await api
            .post('/api/login')
            .send(user)
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })
})

afterAll( async () => {
    await mongoose.connection.close()
    server.close()
})