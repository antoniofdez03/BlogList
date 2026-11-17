const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')
const User = require('../models/User')
const userExtractor = require('../utils/userExtractor')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('author', {
    username: 1,
    name: 1
  })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    const blog = await Blog.findById(id).populate('author', {
      username: 1,
      name: 1
    })

    if (blog)
      response.json(blog)
    else
      response.status(404).end()
    
  } catch (error) {
    next(error)
  }
})

blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const {
    title,
    url,
    likes
  } = request.body

  const userId = request.userId 
  const user = await User.findById(userId)

  if(!title){
    return response.status(400).json({
      error: 'Note title is missing'
    })
  }

  const newBlog = new Blog({
    title,
    author: user._id,
    url,
    likes
  })
  
  try {
    const savedBlog = await newBlog.save()

    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(savedBlog)
  } catch (error) {next(error)}
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const { id } = request.params

  try {
    const blog = await Blog.findById(id)

    if (!blog) {
      return response.status(404).end()
    }

    if (blog.author.toString() !== request.userId) {
      return response.status(403).json({ error: 'only the author can delete this blog' })
    }

    await Blog.findByIdAndDelete(id)

    await User.findByIdAndUpdate(request.userId, { $pull: { blogs: id } })

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

blogsRouter.put('/:id', userExtractor, async (request, response, next) => {
  const { id } = request.params
  const { title, url, likes } = request.body

  try {
    const blog = await Blog.findById(id)

    if (!blog) {
      return response.status(404).end()
    }

    if (blog.author.toString() !== request.userId) {
      return response.status(403).json({ error: 'only the author can update this blog' })
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { title, url, likes },
      { returnDocument: 'after', runValidators: true }
    )

    response.json(updatedBlog)
  } catch (error) {
    next(error)
  }
})

module.exports = blogsRouter