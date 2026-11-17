const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')
const server = require('../index')
const bcrypt = require('bcrypt')
const userExtractor = require('../utils/userExtractor')
const Blog = require('../models/Blog')
const User = require('../models/User')

const api = supertest(app)

const initialBlogs = [
  { title: 'First blog', url: 'url', likes: 3 },
  { title: 'Second blog', url: 'url', likes: 5 }
]

let testUser
let token

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('1234', 10)
  testUser = await new User({
    username: 'Antoniofdez03',
    name: 'Antonio',
    passwordHash
  }).save()

  const blogs = initialBlogs.map(blog => new Blog({ ...blog, author: testUser._id }))
  await Promise.all(blogs.map(blog => blog.save()))

  const loginResponse = await api
    .post('/api/login')
    .send({ username: 'Antoniofdez03', password: '1234' })

  token = loginResponse.body.token
})

describe('GET', () => {
    test('unique identifier property of blogs is named id', async () => {
        const response = await api.get('/api/blogs')

        const blog = response.body[0]

        expect(blog.id).toBeDefined()
        expect(blog._id).toBeUndefined()
    })

    test('all blogs', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(response.body).toHaveLength(2)
    })

    test('a blog by id', async () => {
        const response = await api.get('/api/blogs')
        const firstBlog = response.body[0]

        const blog = await api
            .get(`/api/blogs/${firstBlog.id}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(blog.body).toEqual(firstBlog)
    })
})

describe('POST', () => {
    test('a blog without token', async () => {
        let newBlog = {
            "title": "new blog",
            "url": "url",
            "likes": 2
        }

        const postResponse = await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        
        expect(postResponse.body.error).toContain('token missing or invalid')
        const getResponse = await api.get('/api/blogs')
        expect(getResponse.body).toHaveLength(initialBlogs.length)
    })

    test('a blog with invalid token', async () => {
        let newBlog = {
            "title": "new blog",
            "url": "url",
            "likes": 2
        }

        const postResponse = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer 1234`)
            .send(newBlog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        
        expect(postResponse.body.error).toContain('token missing or invalid')
        const getResponse = await api.get('/api/blogs')
        expect(getResponse.body).toHaveLength(initialBlogs.length)
    })

    test('a valid blog', async () => {
        let newBlog = {
            "title": "new blog",
            "url": "url",
            "likes": 2
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        const response = await api.get('/api/blogs')
        const titles = response.body.map(blog => blog.title)

        expect(response.body).toHaveLength(initialBlogs.length + 1)
        expect(titles).toContain("new blog")
    })

    test('a blog without likes', async () => {
        let newBlog = {
            title: "new blog",
            url: "url",
        }

        const blog = await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)
        
        expect(blog.body.likes).toBe(0)

        const response = await api.get('/api/blogs')
        const titles = response.body.map(blog => blog.title)
        
        expect(response.body).toHaveLength(initialBlogs.length + 1)
        expect(titles).toContain("new blog")
    })

    test(' a blog without title', async () => {
        let newBlog = {
            url: "url",
            likes: 3
        }

        await api
            .post('/api/blogs')
            .set('Authorization', `Bearer ${token}`)
            .send(newBlog)
            .expect(400)
            .expect('Content-Type', /application\/json/)
        
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(initialBlogs.length)
    })
})

describe('DELETE', () => {
    test('a valid blog can be deleted', async () => {

        const firstResponse = await api.get('/api/blogs')
        const blogToDelete = firstResponse.body[0]
        await api
            .delete(`/api/blogs/${blogToDelete.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)
        
        const secondResponse = await api.get('/api/blogs')      
        expect(secondResponse.body).toHaveLength(initialBlogs.length - 1)
    })

    test('a blog that doesnt exist can be deleted', async () => {
        await api
            .delete(`/api/blogs/1`)
            .set('Authorization', `Bearer ${token}`)
            .expect(400)
        
        const blogs = await api.get('/api/blogs')
        expect(blogs.body).toHaveLength(initialBlogs.length)
    })
})

describe('PUT', () => {
    test('a valid blog can be updated', async () => {
        const firstResponse = await api.get('/api/blogs')
        const blogToUpdate = firstResponse.body[0]

        const newBlogData = {
            title: "first blog updated",
            url: "url",
            likes: 10
        }

        const blog = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(newBlogData)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(blog.body).toEqual({ ...newBlogData, author: testUser._id.toString(), id: blogToUpdate.id })
    })

    test('an invalid blog cant be updated', async () => {
        const blogsAtStart = await api.get('/api/blogs')
        const newBlogData = {
            title: "first blog updated",
            author: "Antonio",
            url: "url",
            likes: 10
        }

        await api
            .put(`/api/blogs/2`)
            .set('Authorization', `Bearer ${token}`)
            .send(newBlogData)
            .expect(400)
            .expect('Content-Type', /application\/json/)

         const blogsAtEnd = await api.get('/api/blogs')
         expect(blogsAtStart.body).toEqual(blogsAtEnd.body)
    })
})

afterAll(() => {
    mongoose.connection.close()
    server.close()
})