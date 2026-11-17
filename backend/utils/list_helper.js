const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    let result = 0
    blogs.forEach(blog => {
        result += blog.likes
    })

    return result
}

const favoriteBlog = (blogs) => {
    if(blogs.length === 0) return null
    return blogs.reduce((max, blog) => blog.likes > max.likes ? blog : max)
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}