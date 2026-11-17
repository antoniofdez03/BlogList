const mongoose = require('mongoose')
const {Schema, model} = mongoose

const blogSchema = mongoose.Schema({
    title: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    url: String,
    likes: {
        type: Number,
        default: 0
    }
})

blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Blog = model('Blog', blogSchema)

module.exports = Blog