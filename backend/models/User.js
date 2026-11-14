const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    username: {
        type: String,
        minLength: [3, 'Username must be at least 3 characters long'],
        required: true,
        unique: true,
        trim: true
    },
    name: String,
    passwordHash: {
        type: String,
        required: true
    }
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User