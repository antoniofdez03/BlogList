const app = require('../app')
const supertest = require('supertest')
const mongoose = require('mongoose')
const server = require('../index')
const Blog = require('../models/Blog')
const { initialBlogs } = require('../utils/list_helper')

const api = supertest(app)

beforeEach(async () => {
    await Blog.deleteMany({})

    for( let blog of initialBlogs) {
        const blogObject = new Blog(blog)
        await blogObject.save()
    }
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
    test('a valid blog', async () => {
        let newBlog = {
            "title": "new blog",
            "author": "Antonio",
            "url": "url",
            "likes": 2
        }

        await api
            .post('/api/blogs')
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
            author: "Antonio",
            url: "url",
        }

        const blog = await api
            .post('/api/blogs')
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
            author: "Antonio",
            url: "url",
            likes: 3
        }

        await api
            .post('/api/blogs')
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
            .expect(204)
        
        const secondResponse = await api.get('/api/blogs')      
        expect(secondResponse.body).toHaveLength(initialBlogs.length - 1)
    })

    test('a blog that doesnt exist can be deleted', async () => {
        await api
            .delete(`/api/blogs/1`)
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
            author: "Antonio",
            url: "url",
            likes: 10
        }

        const blog = await api
            .put(`/api/blogs/${blogToUpdate.id}`)
            .send(newBlogData)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        expect(blog.body).toEqual({ ...newBlogData, id: blogToUpdate.id })
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