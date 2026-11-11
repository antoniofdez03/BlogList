const blogsRouter = require('express').Router()
const Blog = require('../models/Blog')

blogsRouter.get('/', (request, response) => {
  Blog.find({}).then(blogs => {
    response.json(blogs)
  })

})

blogsRouter.get('/:id', (request, response) => {
  const {id} = request.params
  Blog.findById(id)
    .then(blog => {
      if (blog) {
        response.json(blog)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))

})

blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  if(!blog || !blog.title || !blog.author){
    return response.status(400).json({
      error: 'Blog data missing'
    })
  }

  blog
      .save()
      .then(result => {
          response.status(201).json(result)
      })
})

blogsRouter.delete('/:id', (request, response, next) => {
  const {id} = request.params    

  Blog.findByIdAndDelete(id).then(() => {
      response.status(204).end()
  }).catch(error => next(error))
})

blogsRouter.put('/:id', (request, response, next) => {
  const {id} = request.params
  const blog = request.body

  const newBlogInfo = {
        title: blog.title,
        author: blog.author,
        url: blog.url,
        likes: blog.likes
    } 

  Blog.findByIdAndUpdate(id, newBlogInfo, { new: true }).then( savedBlog => {
        response.json(savedBlog)
    }).catch(error => next(error))
})

module.exports = blogsRouter